/**
 * APEX SCM Suite - MRP (자재소요계획) 및 재고 예측 연산 유틸리티 (calculateMRP.ts)
 * 
 * 1. 발주서(Ordersheet)의 월별 완제품 오더 수량
 * 2. BOM 관계(Relation)의 1대당 소요량(point) 재귀 전개
 * 3. 공용 부품 자동 합산
 * 4. 다중 월(Multi-Month) 선택 지원 및 누적 소요량 산출
 * 5. ★ 재입고 없이 사용 가능한 시점 (Stock Runway / Depletion Month) 실시간 분석
 * 6. 현재고, 안전재고, 과부족 상태 판정 및 MOQ 기반 권장 발주량 산출
 */

export interface MRPItemResult {
  id: number;
  itemName: string;
  type: string;
  category: string;
  stock: number;
  safety_stock: number;
  moq: number;
  supplyer: string;
  lead_time: string;
  suppliers: { name: string; price: number; lt: string; moq: number }[];
  rfq_status: string;
  selected_supplier: string;
  grossReq: number; // 선택된 월들의 누적 총 소요량
  expectedBalance: number; // 예상 잔여재고 (현재고 - 누적 소요량)
  status: 'DANGER' | 'WARNING' | 'NORMAL'; // 발주긴급 / 주의 / 정상
  shortage: number; // 순부족 수량 (누적소요량 + 안전재고 - 현재고)
  suggestedPo: number; // MOQ 반영 권장 발주량
  // ★ 재고 소진 시점(Runway) 분석 지표
  safeUntilMonth: string | null; // 재입고 없이 버틸 수 있는 마지막 월 (예: 'Sep')
  depletionMonth: string | null; // 재고가 바닥나는 월 (예: 'Oct')
  runwayText: string; // 직관적 표기 문구 (예: "Sep까지 사용 가능 (Oct 소진)")
  runwayStatus: 'SAFE' | 'WARNING' | 'DANGER';
  monthlyReqMap: { [month: string]: number }; // 선택된 각 월별 개별 소요량
}

export const ALL_ORDER_MONTHS = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan'];

export const calculateMRP = (
  items: any[] | null,
  relations: { UpperId: number; LowerId: number; point: number }[] | null,
  orderData: any[] | null,
  selectedMonths: string[] | string = ['Sep']
): Map<number, MRPItemResult> => {
  const resultMap = new Map<number, MRPItemResult>();
  if (!items || items.length === 0) return resultMap;

  // 인자 정규화: 배열 형태로 변환 및 시간 순서 보존
  const rawMonths = Array.isArray(selectedMonths)
    ? selectedMonths
    : [selectedMonths];
  
  // ALL_ORDER_MONTHS 순서에 맞게 정렬하여 타임라인 순차 시뮬레이션 보장
  const months = ALL_ORDER_MONTHS.filter((m) => rawMonths.includes(m));
  const activeMonths = months.length > 0 ? months : ['Sep'];

  // 1. 아이템 맵 구성
  const itemMap = new Map<number, any>();
  items.forEach((item) => itemMap.set(item.id, item));

  // 2. Relation UpperId 기준 인덱싱
  const childrenMap = new Map<number, { LowerId: number; point: number }[]>();
  if (relations) {
    relations.forEach((rel) => {
      const uId = Number(rel.UpperId);
      const list = childrenMap.get(uId) || [];
      list.push({ LowerId: Number(rel.LowerId), point: Number(rel.point) || 1 });
      childrenMap.set(uId, list);
    });
  }

  // 3. 발주서 데이터로부터 완제품(SET)의 특정 월 오더 수량 조회 헬퍼
  const getSetOrderQty = (item: any, month: string): number => {
    if (!orderData || orderData.length === 0) return 0;
    const gName = item.Good?.groupName || item.groupName || '';
    const match = orderData.find((o) => {
      const orderItem = String(o.Item || o.groupName || o.itemName || '');
      return (
        (gName && orderItem === gName) ||
        (item.itemName && orderItem === item.itemName) ||
        (gName && orderItem.includes(gName)) ||
        (item.itemName && orderItem.includes(item.itemName))
      );
    });
    if (!match) return 0;
    return Number(match[month]) || 0;
  };

  // 4. 각 월별, 품목별 순소요량 맵: monthlyGrossReqMap.get(month).get(itemId)
  const monthlyGrossReqMap = new Map<string, Map<number, number>>();
  activeMonths.forEach((m) => {
    const map = new Map<number, number>();
    items.forEach((item) => map.set(item.id, 0));
    monthlyGrossReqMap.set(m, map);
  });

  // 5. 각 월별로 BOM 전개 연산 수행
  activeMonths.forEach((m) => {
    const currentMonthReq = monthlyGrossReqMap.get(m)!;

    items
      .filter((item) => item.type === 'SET')
      .forEach((setItem) => {
        const setQty = getSetOrderQty(setItem, m);
        currentMonthReq.set(setItem.id, (currentMonthReq.get(setItem.id) || 0) + setQty);

        // BFS로 하위 부품 전개 (곱연산)
        const queue: { id: number; currentMultiplier: number }[] = [
          { id: setItem.id, currentMultiplier: setQty },
        ];

        while (queue.length > 0) {
          const { id, currentMultiplier } = queue.shift()!;
          const children = childrenMap.get(id) || [];

          for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const childQty = currentMultiplier * child.point;
            const prevTotal = currentMonthReq.get(child.LowerId) || 0;
            currentMonthReq.set(child.LowerId, prevTotal + childQty);

            // 하위 품목이 ASSY인 경우 손자 부품으로 계속 전개
            const childItem = itemMap.get(child.LowerId);
            if (childItem && childItem.type === 'ASSY') {
              queue.push({ id: child.LowerId, currentMultiplier: childQty });
            }
          }
        }
      });
  });

  // 6. 각 품목별 최종 누적 소요량 및 재고 소진 시점(Stock Runway) 연산
  items.forEach((item) => {
    const stock = Number(item.stock) || 0;
    const safetyStock = Number(item.safety_stock) || 0;
    const moq = Number(item.moq) || 1;

    let cumulativeGrossReq = 0;
    const monthlyReqMap: { [month: string]: number } = {};

    // 월별 소요량 수집 및 누적합
    activeMonths.forEach((m) => {
      const req = monthlyGrossReqMap.get(m)?.get(item.id) || 0;
      monthlyReqMap[m] = req;
      cumulativeGrossReq += req;
    });

    const expectedBalance = stock - cumulativeGrossReq;

    // ★ 재고 소진 시점 (Stock Runway) 시뮬레이션
    let remainingStock = stock;
    let safeUntilMonth: string | null = null;
    let depletionMonth: string | null = null;

    for (let i = 0; i < activeMonths.length; i++) {
      const m = activeMonths[i];
      const req = monthlyReqMap[m] || 0;

      if (req === 0) {
        // 해당 월에 소요량이 없으면 기존 안전 상태 유지
        safeUntilMonth = m;
        continue;
      }

      if (remainingStock >= req) {
        remainingStock -= req;
        safeUntilMonth = m; // 이 월까지는 재입고 없이 정상 사용 가능!
      } else {
        // 이 월에서 재고가 부족해짐
        depletionMonth = m;
        break;
      }
    }

    // Runway 텍스트 및 상태 판정
    let runwayText = '';
    let runwayStatus: 'SAFE' | 'WARNING' | 'DANGER' = 'SAFE';

    if (cumulativeGrossReq === 0) {
      runwayText = '소요량 없음 (재고 유지)';
      runwayStatus = 'SAFE';
    } else if (depletionMonth === null) {
      // 선택된 모든 월을 재입고 없이 버팀
      const lastMonth = activeMonths[activeMonths.length - 1];
      runwayText = `${lastMonth}까지 사용 가능 (전량 충족)`;
      runwayStatus = expectedBalance < safetyStock ? 'WARNING' : 'SAFE';
    } else {
      // 중간 또는 첫 월에서 소진
      if (safeUntilMonth === null) {
        // 첫 번째 월부터 즉시 부족
        runwayText = `즉시 부족 (${depletionMonth} 소진)`;
        runwayStatus = 'DANGER';
      } else {
        // 이전 월까지는 버텼으나 depletionMonth에 소진
        runwayText = `${safeUntilMonth}까지 사용 가능 (${depletionMonth} 소진)`;
        runwayStatus = 'WARNING';
      }
    }

    // 종합 상태 판정 (DANGER / WARNING / NORMAL)
    let status: 'DANGER' | 'WARNING' | 'NORMAL' = 'NORMAL';
    if (expectedBalance < 0) {
      status = 'DANGER'; // 발주 긴급
    } else if (expectedBalance < safetyStock) {
      status = 'WARNING'; // 안전재고 미달 주의
    }

    // 순부족 수량 및 권장 발주량 계산 (MOQ 올림)
    const rawShortage = (cumulativeGrossReq + safetyStock) - stock;
    const shortage = rawShortage > 0 ? rawShortage : 0;
    let suggestedPo = 0;
    if (shortage > 0) {
      suggestedPo = moq > 0 ? Math.ceil(shortage / moq) * moq : shortage;
    }

    // 복수 공급처 파싱
    let suppliersList: { name: string; price: number; lt: string; moq: number }[] = [];
    try {
      if (typeof item.suppliers === 'string' && item.suppliers.trim().startsWith('[')) {
        suppliersList = JSON.parse(item.suppliers);
      } else if (Array.isArray(item.suppliers)) {
        suppliersList = item.suppliers;
      }
    } catch (e) {
      suppliersList = [];
    }

    if (suppliersList.length === 0 && item.supplyer) {
      suppliersList = [
        {
          name: item.supplyer,
          price: item.im_price || 0,
          lt: item.lead_time || '2주',
          moq: item.moq || 100,
        },
      ];
    }

    resultMap.set(item.id, {
      id: item.id,
      itemName: item.itemName,
      type: item.type,
      category: item.category,
      stock,
      safety_stock: safetyStock,
      moq,
      supplyer: item.supplyer || (suppliersList[0]?.name ?? ''),
      lead_time: item.lead_time || '2주',
      suppliers: suppliersList,
      rfq_status: item.rfq_status || 'IDLE',
      selected_supplier: item.selected_supplier || suppliersList[0]?.name || item.supplyer || '',
      grossReq: cumulativeGrossReq,
      expectedBalance,
      status,
      shortage,
      suggestedPo,
      safeUntilMonth,
      depletionMonth,
      runwayText,
      runwayStatus,
      monthlyReqMap,
    });
  });

  return resultMap;
};
