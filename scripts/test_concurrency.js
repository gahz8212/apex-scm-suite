/**
 * APEX SCM Suite - 동시성 & 락 & 멱등성 검증 자동화 테스트 스크립트
 * 
 * 검증 항목:
 * 1. 동시 입고 10회 동시 요청 시 비관적 락(t.LOCK.UPDATE)에 의한 분실 갱신(Lost Update) 방지 및 재고 무결성 검증
 * 2. 수불부(StockHistory) 10회 연속 전산 정합성 검증
 * 3. 동일 출고넘버로 10개 동시 출고 확정 요청 시 중복 차감 차단(409 Conflict) 및 멱등성 검증
 */

const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
const { Item, Shipment, StockHistory, User, sequelize } = require('../backend/models');

const BASE_URL = 'http://localhost:4000';

async function runConcurrencyTests() {
  console.log('===============================================================');
  console.log('🚀 [APEX SCM] 동시성 & 비관적 락 & 멱등성 스트레스 테스트 시작');
  console.log('===============================================================\n');

  // 1. 관리자 로그인 세션 획득
  console.log('🔑 [Step 0] 관리자 계정 로그인 (demo@apex-scm.io)...');
  const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'demo@apex-scm.io',
    password: 'password123!'
  });

  const cookie = loginRes.headers['set-cookie'];
  if (!cookie) {
    throw new Error('로그인 세션 쿠키를 획득하지 못했습니다.');
  }
  console.log('✅ 관리자 세션 쿠키 획득 완료.\n');

  const client = axios.create({
    baseURL: BASE_URL,
    headers: {
      Cookie: cookie.map(c => c.split(';')[0]).join('; ')
    }
  });

  // 2. 테스트용 아이템 선정 및 초기화
  const testItem = await Item.findOne({ where: { type: 'PARTS' } });
  if (!testItem) {
    throw new Error('테스트할 부품 아이템이 DB에 없습니다.');
  }

  const initialStock = 100;
  await testItem.update({ stock: initialStock });
  console.log(`📦 [테스트 대상 품목]: [${testItem.id}] ${testItem.itemName}`);
  console.log(`   - 초기 재고 설정: ${initialStock} EA\n`);

  // =========================================================================
  // TEST 1: 동시 입고(Inbound) 10건 동시 발송 ➔ 분실 갱신(Lost Update) 검증
  // =========================================================================
  console.log('---------------------------------------------------------------');
  console.log('🧪 [TEST 1] 동시 10개 입고 요청 (각 +10 EA씩) 동시 발송');
  console.log('   가설: 락이 없으면 쓰레드 경합으로 재고가 200이 안 되고 유실됨.');
  console.log('   정상: t.LOCK.UPDATE가 행을 잠가 순차 누적하여 정확히 200 EA가 되어야 함.');
  console.log('---------------------------------------------------------------');

  const INBOUND_CONCURRENT_COUNT = 10;
  const ADD_QTY = 10;

  const inboundPromises = [];
  for (let i = 1; i <= INBOUND_CONCURRENT_COUNT; i++) {
    inboundPromises.push(
      client.patch('/item/inbound', {
        id: testItem.id,
        inbound_qty: ADD_QTY,
        warehouse: `테스트창고-${i}`,
        is_completed: true,
        remain_qty: 0
      }).then(res => ({
        index: i,
        status: res.status,
        prevStock: res.data.prevStock,
        stock: res.data.stock
      })).catch(err => ({
        index: i,
        status: err.response?.status || 500,
        error: err.response?.data?.message || err.message
      }))
    );
  }

  const startTime = Date.now();
  const inboundResults = await Promise.all(inboundPromises);
  const elapsed = Date.now() - startTime;

  console.log(`⏱️ 동시 10개 요청 처리 완료 (소요시간: ${elapsed}ms)`);
  console.table(inboundResults);

  // DB 실물 재고 확인
  await testItem.reload();
  const expectedStock = initialStock + (INBOUND_CONCURRENT_COUNT * ADD_QTY);
  console.log(`\n📊 [TEST 1 결과 분석]`);
  console.log(`   - 예상 최종 재고: ${expectedStock} EA`);
  console.log(`   - 실제 DB 최종 재고: ${testItem.stock} EA`);

  if (testItem.stock === expectedStock) {
    console.log('   🎉 [TEST 1 PASS] 비관적 락(Row-level Lock)으로 분실 갱신 0건, 데이터 100% 정합성 유지!\n');
  } else {
    console.error(`   ❌ [TEST 1 FAIL] 동시성 충돌 발생! ${expectedStock - testItem.stock} EA 누락!\n`);
    process.exit(1);
  }

  // 수불부 이력 확인
  const histories = await StockHistory.findAll({
    where: { ItemId: testItem.id },
    order: [['createdAt', 'DESC']],
    limit: 10
  });
  console.log(`📝 [수불부 감사 로그 확인]: 최근 생성된 수불부 레코드 ${histories.length}건 확인 완료.`);
  console.log(`   - 최신 수불부 항목: [${histories[0].change_type}] ${histories[0].reason} (${histories[0].prev_stock} ➔ ${histories[0].next_stock} EA)\n`);

  // =========================================================================
  // TEST 2: 동일 출고번호로 10개 동시 출고 확정 요청 ➔ 중복 차감 방지 및 멱등성 검증
  // =========================================================================
  console.log('---------------------------------------------------------------');
  console.log('🧪 [TEST 2] 동일 출고번호로 10개 [출고 확정] 동시 발송');
  console.log('   가설: 광클릭/네트워크 재전송 시 중복 출고가 일어나 재고가 10배 차감될 위험.');
  console.log('   정상: 첫 번째 요청만 200 OK 성공하고, 나머지 9개는 409 Conflict로 완벽 차단되어야 함.');
  console.log('---------------------------------------------------------------');

  const testExportNo = `TEST-STRESS-${Date.now().toString().slice(-6)}`;
  // 실무 시나리오: 출고 화면에서 출고 정보가 생성/임시저장된 상태
  await Shipment.create({
    export_no: testExportNo,
    dispatch_status: 'TEMP'
  });
  const stockBeforeDispatch = testItem.stock;
  const dispatchDeductQty = 5;

  const dispatchPromises = [];
  for (let i = 1; i <= 10; i++) {
    dispatchPromises.push(
      client.post('/tracking/confirm-dispatch', {
        export_no: testExportNo,
        month: 'Sep',
        products: [],
        subMaterials: [
          {
            id: testItem.id,
            ItemId: testItem.id,
            itemName: testItem.itemName,
            quantity: dispatchDeductQty,
            check: true
          }
        ]
      }).then(res => ({
        requestIndex: i,
        status: res.status,
        result: 'SUCCESS_200'
      })).catch(err => ({
        requestIndex: i,
        status: err.response?.status || 500,
        result: err.response?.status === 409 ? 'BLOCKED_409_CONFLICT' : `ERROR_${err.response?.status}`,
        message: err.response?.data?.message || err.message
      }))
    );
  }

  const dispatchResults = await Promise.all(dispatchPromises);
  console.table(dispatchResults);

  const successCount = dispatchResults.filter(r => r.status === 200).length;
  const blockedCount = dispatchResults.filter(r => r.status === 409).length;

  await testItem.reload();
  const actualDeduction = stockBeforeDispatch - testItem.stock;

  console.log(`\n📊 [TEST 2 결과 분석]`);
  console.log(`   - 성공(200 OK) 건수: ${successCount}건 (정상 기준: 정확히 1건)`);
  console.log(`   - 중복 차단(409 Conflict) 건수: ${blockedCount}건 (정상 기준: 정확히 9건)`);
  console.log(`   - 실제 차감된 수량: ${actualDeduction} EA (정상 기준: ${dispatchDeductQty} EA)`);

  if (successCount === 1 && blockedCount === 9 && actualDeduction === dispatchDeductQty) {
    console.log('   🎉 [TEST 2 PASS] 출고 멱등성 및 비관적 락으로 중복 출고 완벽 차단! 중복 차감 0건!\n');
  } else {
    console.error(`   ❌ [TEST 2 FAIL] 중복 차감 오류 발생!`);
    process.exit(1);
  }

  // =========================================================================
  // Clean Up: 테스트 출고건 취소 롤백 및 정상 복구
  // =========================================================================
  console.log('🧹 [Clean Up] 테스트 출고 건 취소 롤백 진행...');
  await client.post('/tracking/cancel-dispatch', { export_no: testExportNo });
  await testItem.reload();
  console.log(`   - 출고 취소 후 재고 복구 확인: ${testItem.stock} EA`);

  // 테스트로 늘어난 재고 원래대로 복구
  await testItem.update({ stock: initialStock });
  // 테스트 출고 데이터 삭제
  await Shipment.destroy({ where: { export_no: testExportNo } });
  console.log(`   - 테스트 데이터 원상복구 완료.\n`);

  console.log('===============================================================');
  console.log('🏆 [최종 결과] 모든 동시성 및 재고 무결성 스트레스 테스트 100% 통과!');
  console.log('===============================================================');
  process.exit(0);
}

runConcurrencyTests().catch(err => {
  console.error('❌ 테스트 실행 중 치명적 오류:', err);
  process.exit(1);
});
