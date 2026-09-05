/**
 * APEX SCM Suite - 시드 데이터 생성 스크립트 (seed.js)
 * 
 * B2B 제조/무역 실무 데모를 위해 아래의 완성도 높은 샘플 데이터를 구축합니다:
 * 1. 데모 사용자 계정 (demo@apex-scm.io / password123!)
 * 2. 완제품(SET), 조립 모듈(ASSY), 부품(PARTS) 계층형 품목 데이터
 * 3. 부품 소요량(BOM) 관계 데이터 (Relation)
 * 4. 월별 발주 현황 데이터 (Order) 및 수출 오더시트 (ordersheet)
 * 5. 컨테이너 선적 팔레트 적재 데이터 (Pallet)
 * 6. 출하 피킹 리스트 데이터 (Picker)
 */

require("dotenv").config();
const bcrypt = require("bcrypt");
const { sequelize, User, Good, Item, Relation, Order, Pallet, Picker, Image } = require("./models");

async function seed() {
  console.log("🚀 시드 데이터 생성을 시작합니다...");

  // 1. 테이블 동기화
  await sequelize.sync({ force: true });
  console.log("✅ 테이블 초기화(sync) 완료");

  // 2. 데모 사용자 생성
  const hashedPassword = await bcrypt.hash("password123!", 12);
  const demoUser = await User.create({
    email: "demo@apex-scm.io",
    name: "데모 관리자",
    password: hashedPassword,
  });
  console.log(`✅ 데모 계정 생성: ${demoUser.email} (비밀번호: password123!)`);

  // 3. 제품 그룹(Good) 생성 (hooks: false로 자동 Item 생성 훅 우회)
  const [good1, good2, good3] = await Good.bulkCreate(
    [
      { groupName: "APEX-1000", itemName: "APEX-1000 PRO SET" },
      { groupName: "APEX-200", itemName: "APEX-200 MINI SET" },
      { groupName: "NEXUS-500", itemName: "NEXUS-500 SMART SET" },
    ],
    { hooks: false }
  );
  console.log("✅ 제품 그룹(Good) 3건 생성 완료");

  // 4. 품목 데이터(Item) 생성 (SET, ASSY, PARTS)
  const itemsData = [
    // --- [완제품 SET] ---
    {
      id: 1,
      type: "SET",
      groupType: "MAIN",
      groupName: "APEX-1000",
      itemName: "APEX-1000 PRO SET",
      descript: "디지털 무선 송수신 컨트롤러 완제품 세트 (원거리 1000M)",
      category: "EDT",
      unit: "\\",
      im_price: 28500,
      sum_im_price: 28500,
      ex_price: 48.5,
      weight: 1.25,
      cbm: 0.008,
      moq: 100,
      sets: "SET",
      number1: 1,
      number2: 1,
      use: true,
      supplyer: "자체제조",
      GoodId: good1.id,
    },
    {
      id: 2,
      type: "SET",
      groupType: "SUB",
      groupName: "APEX-200",
      itemName: "APEX-200 MINI SET",
      descript: "초소형 경량 방수 수신기 세트 (IPX7 방수)",
      category: "EDT",
      unit: "\\",
      im_price: 19800,
      sum_im_price: 19800,
      ex_price: 32.0,
      weight: 0.75,
      cbm: 0.005,
      moq: 200,
      sets: "SET",
      number1: 1,
      number2: 2,
      use: true,
      supplyer: "자체제조",
      GoodId: good2.id,
    },
    {
      id: 3,
      type: "SET",
      groupType: "NEW",
      groupName: "NEXUS-500",
      itemName: "NEXUS-500 SMART SET",
      descript: "스마트 GPS 트래킹 컨트롤러 완제품 세트",
      category: "RDT",
      unit: "\\",
      im_price: 34200,
      sum_im_price: 34200,
      ex_price: 58.0,
      weight: 1.45,
      cbm: 0.009,
      moq: 100,
      sets: "SET",
      number1: 2,
      number2: 1,
      use: true,
      supplyer: "자체제조",
      GoodId: good3.id,
    },

    // --- [중간 조립 모듈 ASSY] ---
    {
      id: 10,
      type: "ASSY",
      groupType: null,
      groupName: "",
      itemName: "APEX-1000 MAIN PCB ASSY",
      descript: "APEX-1000 메인 제어 기판 조립 모듈",
      category: "회로",
      unit: "\\",
      im_price: 14200,
      sum_im_price: 14200,
      ex_price: 22.0,
      weight: 0.35,
      cbm: 0.002,
      moq: 500,
      sets: "SET",
      number1: 3,
      number2: 1,
      use: true,
      supplyer: "협력사A",
      GoodId: null,
    },
    {
      id: 11,
      type: "ASSY",
      groupType: null,
      groupName: "",
      itemName: "APEX-1000 CASE & GASKET ASSY",
      descript: "외장 케이스 방수 기구 조립 모듈",
      category: "기구",
      unit: "\\",
      im_price: 7800,
      sum_im_price: 7800,
      ex_price: 12.5,
      weight: 0.45,
      cbm: 0.003,
      moq: 500,
      sets: "SET",
      number1: 3,
      number2: 2,
      use: true,
      supplyer: "신성기구",
      GoodId: null,
    },
    {
      id: 12,
      type: "ASSY",
      groupType: null,
      groupName: "",
      itemName: "APEX-1000 RF POWER ASSY",
      descript: "RF 송신 안테나 & 대용량 배터리 전원 모듈",
      category: "전장",
      unit: "\\",
      im_price: 6500,
      sum_im_price: 6500,
      ex_price: 10.0,
      weight: 0.35,
      cbm: 0.002,
      moq: 500,
      sets: "SET",
      number1: 3,
      number2: 3,
      use: true,
      supplyer: "에너지텍",
      GoodId: null,
    },

    // --- [단품 부품 PARTS] ---
    {
      id: 101,
      type: "PARTS",
      groupType: null,
      groupName: "",
      itemName: "MCU CHIP STM32F4-LQFP",
      descript: "32-bit Cortex-M4 메인 마이크로컨트롤러",
      category: "회로",
      unit: "\\",
      im_price: 3500,
      sum_im_price: 3500,
      ex_price: 5.5,
      weight: 0.02,
      cbm: 0.0001,
      moq: 1000,
      sets: "SET",
      number1: 4,
      number2: 1,
      use: true,
      supplyer: "ST마이크로",
      GoodId: null,
    },
    {
      id: 102,
      type: "PARTS",
      groupType: null,
      groupName: "",
      itemName: "SMD RESISTOR 10K 0603",
      descript: "칩 저항 10K Ohm 1% 1005규격",
      category: "회로",
      unit: "\\",
      im_price: 20,
      sum_im_price: 20,
      ex_price: 0.03,
      weight: 0.001,
      cbm: 0.0001,
      moq: 5000,
      sets: "SET",
      number1: 4,
      number2: 2,
      use: true,
      supplyer: "삼성전기",
      GoodId: null,
    },
    {
      id: 103,
      type: "PARTS",
      groupType: null,
      groupName: "",
      itemName: "CERAMIC CAPACITOR 100nF",
      descript: "MLCC 100nF 50V X7R 1608규격",
      category: "회로",
      unit: "\\",
      im_price: 30,
      sum_im_price: 30,
      ex_price: 0.05,
      weight: 0.001,
      cbm: 0.0001,
      moq: 5000,
      sets: "SET",
      number1: 4,
      number2: 3,
      use: true,
      supplyer: "무라타",
      GoodId: null,
    },
    {
      id: 104,
      type: "PARTS",
      groupType: null,
      groupName: "",
      itemName: "TACT SWITCH 6x6MM (SMD)",
      descript: "택트 스위치 방수 타입",
      category: "회로",
      unit: "\\",
      im_price: 180,
      sum_im_price: 180,
      ex_price: 0.3,
      weight: 0.005,
      cbm: 0.0001,
      moq: 2000,
      sets: "SET",
      number1: 4,
      number2: 4,
      use: true,
      supplyer: "알프스",
      GoodId: null,
    },
    {
      id: 105,
      type: "PARTS",
      groupType: null,
      groupName: "",
      itemName: "TOP HOUSING (PC/ABS BLACK)",
      descript: "상부 사출 성형 케이스 (방염 PC/ABS)",
      category: "기구",
      unit: "\\",
      im_price: 2200,
      sum_im_price: 2200,
      ex_price: 3.5,
      weight: 0.18,
      cbm: 0.0008,
      moq: 1000,
      sets: "SET",
      number1: 5,
      number2: 1,
      use: true,
      supplyer: "삼화정밀",
      GoodId: null,
    },
    {
      id: 106,
      type: "PARTS",
      groupType: null,
      groupName: "",
      itemName: "BOTTOM HOUSING (PC/ABS)",
      descript: "하부 사출 성형 케이스",
      category: "기구",
      unit: "\\",
      im_price: 2100,
      sum_im_price: 2100,
      ex_price: 3.3,
      weight: 0.17,
      cbm: 0.0008,
      moq: 1000,
      sets: "SET",
      number1: 5,
      number2: 2,
      use: true,
      supplyer: "삼화정밀",
      GoodId: null,
    },
    {
      id: 107,
      type: "PARTS",
      groupType: null,
      groupName: "",
      itemName: "SILICONE O-RING GASKET",
      descript: "방수 실리콘 가스켓 (IPX7 규격)",
      category: "기구",
      unit: "\\",
      im_price: 550,
      sum_im_price: 550,
      ex_price: 0.9,
      weight: 0.01,
      cbm: 0.0001,
      moq: 3000,
      sets: "SET",
      number1: 5,
      number2: 3,
      use: true,
      supplyer: "한림고무",
      GoodId: null,
    },
    {
      id: 108,
      type: "PARTS",
      groupType: null,
      groupName: "",
      itemName: "M2.6x6 SCREW (SUS304)",
      descript: "스테인리스 방청 체결용 스크류 볼트",
      category: "기구",
      unit: "\\",
      im_price: 45,
      sum_im_price: 45,
      ex_price: 0.07,
      weight: 0.002,
      cbm: 0.0001,
      moq: 10000,
      sets: "SET",
      number1: 5,
      number2: 4,
      use: true,
      supplyer: "대동화스너",
      GoodId: null,
    },
    {
      id: 109,
      type: "PARTS",
      groupType: null,
      groupName: "",
      itemName: "LIPO BATTERY 3.7V 850MAH",
      descript: "충전식 리튬 폴리머 배터리 팩 (KC/UL인증)",
      category: "전장",
      unit: "\\",
      im_price: 4600,
      sum_im_price: 4600,
      ex_price: 7.2,
      weight: 0.12,
      cbm: 0.0003,
      moq: 1000,
      sets: "SET",
      number1: 6,
      number2: 1,
      use: true,
      supplyer: "LG에너지",
      GoodId: null,
    },
    {
      id: 110,
      type: "PARTS",
      groupType: null,
      groupName: "",
      itemName: "ANTENNA 433MHZ RUBBER",
      descript: "433MHz 고감도 헬리컬 러버 안테나",
      category: "전장",
      unit: "\\",
      im_price: 1350,
      sum_im_price: 1350,
      ex_price: 2.1,
      weight: 0.05,
      cbm: 0.0002,
      moq: 1000,
      sets: "SET",
      number1: 6,
      number2: 2,
      use: true,
      supplyer: "파트론",
      GoodId: null,
    },
    {
      id: 111,
      type: "PARTS",
      groupType: null,
      groupName: "",
      itemName: "INDIVIDUAL COLOR GIFT BOX",
      descript: "제품 개별 유광 코팅 컬러 선물 박스",
      category: "포장",
      unit: "\\",
      im_price: 980,
      sum_im_price: 980,
      ex_price: 1.5,
      weight: 0.08,
      cbm: 0.001,
      moq: 1000,
      sets: "SET",
      number1: 7,
      number2: 1,
      use: true,
      supplyer: "삼보판지",
      GoodId: null,
    },
    {
      id: 112,
      type: "PARTS",
      groupType: null,
      groupName: "",
      itemName: "EXPORT MASTER CARTON (A골)",
      descript: "20개입 마스터 수출용 골판지 카톤 박스",
      category: "포장",
      unit: "\\",
      im_price: 2400,
      sum_im_price: 2400,
      ex_price: 3.8,
      weight: 0.45,
      cbm: 0.045,
      moq: 500,
      sets: "SET",
      number1: 7,
      number2: 2,
      use: true,
      supplyer: "삼보판지",
      GoodId: null,
    },
  ];

  await Item.bulkCreate(itemsData);
  console.log(`✅ 품목 데이터(Item) ${itemsData.length}건 생성 완료 (SET 3건, ASSY 3건, PARTS 12건)`);

  // 5. BOM 부품 관계도 (Relation) 생성
  // UpperId (상위 부품/세트) -> LowerId (하위 부품) -> point (소요량)
  const relationsData = [
    // [APEX-1000 PRO SET (ID: 1)] -> 하위 모듈
    { UpperId: 1, LowerId: 10, point: 1 }, // MAIN PCB ASSY x1
    { UpperId: 1, LowerId: 11, point: 1 }, // CASE & GASKET ASSY x1
    { UpperId: 1, LowerId: 12, point: 1 }, // RF POWER ASSY x1
    { UpperId: 1, LowerId: 111, point: 1 }, // GIFT BOX x1

    // [APEX-1000 MAIN PCB ASSY (ID: 10)] -> 하위 소자들
    { UpperId: 10, LowerId: 101, point: 1 }, // MCU CHIP x1
    { UpperId: 10, LowerId: 102, point: 8 }, // RESISTOR x8
    { UpperId: 10, LowerId: 103, point: 6 }, // CAPACITOR x6
    { UpperId: 10, LowerId: 104, point: 4 }, // TACT SWITCH x4

    // [APEX-1000 CASE & GASKET ASSY (ID: 11)] -> 하위 기구물
    { UpperId: 11, LowerId: 105, point: 1 }, // TOP HOUSING x1
    { UpperId: 11, LowerId: 106, point: 1 }, // BOTTOM HOUSING x1
    { UpperId: 11, LowerId: 107, point: 1 }, // O-RING GASKET x1
    { UpperId: 11, LowerId: 108, point: 4 }, // M2.6 SCREW x4

    // [APEX-1000 RF POWER ASSY (ID: 12)] -> 전원/RF
    { UpperId: 12, LowerId: 109, point: 1 }, // LIPO BATTERY x1
    { UpperId: 12, LowerId: 110, point: 1 }, // ANTENNA x1

    // [APEX-200 MINI SET (ID: 2)] -> 하위 구성품
    { UpperId: 2, LowerId: 10, point: 1 },
    { UpperId: 2, LowerId: 107, point: 2 },
    { UpperId: 2, LowerId: 108, point: 4 },
    { UpperId: 2, LowerId: 109, point: 1 },
    { UpperId: 2, LowerId: 111, point: 1 },
  ];

  await Relation.bulkCreate(relationsData);
  console.log(`✅ BOM 부품 관계도(Relation) ${relationsData.length}건 연결 완료`);

  // 6. 월별 수주/발주 데이터 (Order) 생성 (5~6개월치 롤링 오더: Sep ~ Jan)
  const ordersData = [
    {
      Item: "APEX-1000",
      Sep: 1900,
      Oct: 2200,
      Nov: 2500,
      Dec: 2100,
      Jan: 800,
    },
    {
      Item: "APEX-200",
      Sep: 2600,
      Oct: 3000,
      Nov: 3500,
      Dec: 2800,
      Jan: 1200,
    },
    {
      Item: "NEXUS-500",
      Sep: 1500,
      Oct: 1700,
      Nov: 2000,
      Dec: 1600,
      Jan: 400,
    },
  ];
  await Order.bulkCreate(ordersData);
  console.log("✅ 월별 발주 현황(Order) 3건 생성 완료 (Sep ~ Jan)");

  // 7. 오더시트(ordersheet) 테이블 생성 및 뷰 동기화
  await sequelize.query(`drop table if exists ordersheet`);
  await sequelize.query(`
    create table ordersheet (
      SELECT 
      G.itemName,
      O.Sep, O.Oct, O.Nov, O.Dec, O.Jan,
      L.descript,
      L.category,
      L.unit,
      L.im_price,
      L.ex_price,
      L.weight,
      L.cbm,
      L.moq,
      L.sets,
      L.number1,
      L.number2,
      L.use,
      date_format(L.input_date,'%Y-%m-%d') as input_date
      FROM Good G 
      inner join Item L on G.itemName=L.itemName
      left join orders O on G.groupName=O.Item
      WHERE L.use=1 
      ORDER BY L.number1, L.number2
    )
  `);
  console.log("✅ 수출 오더시트(ordersheet) 테이블 생성 완료 (Sep ~ Jan)");

  // 8. 컨테이너 팔레트(Pallet)는 사용자가 Packing 폼에서 D&D하여 입력하므로 기본값 없이 비워둡니다.
  await Pallet.destroy({ where: {} });
  console.log("✅ 팔레트(Pallet) 테이블 초기화 완료 (기본값 없음, Packing 폼 D&D 전용)");

  // 9. 출하 피킹 리스트(Picker)는 사용자가 Item Master에서 직접 부자재를 선택하여 수집하므로 기본값 없이 비워둡니다.
  await Picker.destroy({ where: {} });
  console.log("✅ 출하 피킹 리스트(Picker) 초기화 완료 (기본값 없음, 사용자 선택 전용)");

  console.log("\n🎉 모든 샘플 데이터 시딩이 완벽하게 완료되었습니다!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ 시드 데이터 생성 중 에러 발생:", err);
  process.exit(1);
});
