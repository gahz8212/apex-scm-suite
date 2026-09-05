const express = require('express');
const router = express.Router();
const { Shipment } = require('../models');

/**
 * 마감일자 및 운항일정을 기준으로 현재 물류 단계를 100% 자동 산정하는 함수
 */
function computeShipmentStatus(shipment) {
  const now = new Date();

  // 날짜 파싱 헬퍼
  const parseDate = (d) => {
    if (!d) return null;
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const docClosing = parseDate(shipment.doc_closing_date);
  const cargoClosing = parseDate(shipment.cargo_closing_date);
  const etd = parseDate(shipment.etd);
  const eta = parseDate(shipment.eta);

  // 날짜 차이(일 단위) 계산
  const getDiffDays = (targetDate) => {
    if (!targetDate) return 0;
    const diff = targetDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  let step = 1;
  let statusKey = 'PENDING_DOCS';
  let statusLabel = '서류 마감 대기';
  let statusDesc = '선적 서류(인보이스, 패킹리스트, S/I) 마감 준비 중입니다.';
  let dDayText = '서류 준비 중';

  if (eta && now >= eta) {
    step = 5;
    statusKey = 'DELIVERED';
    statusLabel = '도착항 도착 완료';
    statusDesc = '화물이 목적지 항구에 무사히 도착하여 하역되었습니다.';
    dDayText = '운송 완료';
  } else if (etd && now >= etd) {
    step = 4;
    statusKey = 'IN_TRANSIT';
    statusLabel = '해상 운송 중 (In Transit)';
    statusDesc = '모선이 출항하여 목적지 항구로 항해 중입니다.';
    const daysLeft = getDiffDays(eta);
    dDayText = daysLeft > 0 ? `도착 D-${daysLeft}` : '도착 임박';
  } else if (cargoClosing && now >= cargoClosing) {
    step = 3;
    statusKey = 'LOADED';
    statusLabel = '선적 완료 (출항 대기)';
    statusDesc = 'CY 반입 마감 완료 후 모선 적재가 완료되어 출항을 대기 중입니다.';
    const daysLeft = getDiffDays(etd);
    dDayText = daysLeft > 0 ? `출항 D-${daysLeft}` : '출항 임박';
  } else if (docClosing && now >= docClosing) {
    step = 2;
    statusKey = 'TRUCKING_GATE_IN';
    statusLabel = '내륙 운송 & CY 입고';
    statusDesc = '서류 마감이 완료되어 공장 출하 후 터미널(CY)로 운송 및 반입 중입니다.';
    const daysLeft = getDiffDays(cargoClosing);
    dDayText = daysLeft > 0 ? `CY 마감 D-${daysLeft}` : 'CY 마감 임박';
  } else {
    step = 1;
    statusKey = 'PENDING_DOCS';
    statusLabel = '서류 마감 대기';
    statusDesc = '선적 서류(인보이스, 패킹리스트, S/I) 마감 준비 중입니다.';
    const daysLeft = getDiffDays(docClosing);
    dDayText = daysLeft > 0 ? `서류 마감 D-${daysLeft}` : '서류 마감 임박';
  }

  // 타임라인 이벤트 자동 생성
  const events = [
    {
      step: 1,
      title: '서류 마감 (S/I Cut-off)',
      date: docClosing ? docClosing.toISOString().replace('T', ' ').slice(0, 16) : '-',
      completed: step > 1,
      active: step === 1,
      desc: '선적 서류 제출 및 확정 기한'
    },
    {
      step: 2,
      title: 'CY 반입 마감 (Container Yard Cut-off)',
      date: cargoClosing ? cargoClosing.toISOString().replace('T', ' ').slice(0, 16) : '-',
      completed: step > 2,
      active: step === 2,
      desc: '컨테이너 터미널 반입 마감 기한'
    },
    {
      step: 3,
      title: '모선 선적 (Loaded on Vessel)',
      date: etd ? etd.toISOString().split('T')[0] : '-',
      completed: step > 3,
      active: step === 3,
      desc: '선박 적재 및 출항 준비 완료'
    },
    {
      step: 4,
      title: '해상 운송 (In Transit)',
      date: etd ? etd.toISOString().split('T')[0] : '-',
      completed: step > 4,
      active: step === 4,
      desc: `${shipment.pol || 'KRPUS'} ➔ ${shipment.pod || 'USLGB'} 태평양 횡단 운항`
    },
    {
      step: 5,
      title: '도착항 도착 (Delivered)',
      date: eta ? eta.toISOString().split('T')[0] : '-',
      completed: step >= 5,
      active: step === 5,
      desc: '도착항 터미널 하역 및 화물 인도'
    }
  ];

  return {
    ...shipment.toJSON ? shipment.toJSON() : shipment,
    step,
    statusKey,
    statusLabel,
    statusDesc,
    dDayText,
    events
  };
}

/**
 * 초기 시드 데이터 등록 (DB에 선적 데이터가 없을 경우 기본 3건 자동 생성)
 */
async function ensureSeedShipments() {
  try {
    const count = await Shipment.count();
    if (count === 0) {
      const now = new Date();
      
      // 1. 운송 중 건 (In Transit) - 출항 5일 전, 도착 7일 후
      const etdTransit = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
      const etaTransit = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const docClosingTransit = new Date(etdTransit.getTime() - 3 * 24 * 60 * 60 * 1000);
      const cargoClosingTransit = new Date(etdTransit.getTime() - 1 * 24 * 60 * 60 * 1000);

      // 2. 서류 마감 대기 건 (Pending Docs) - 서류 마감 3일 후, 출항 7일 후
      const etdPending = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const etaPending = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);
      const docClosingPending = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const cargoClosingPending = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

      // 3. 도착 완료 건 (Delivered) - 출항 20일 전, 도착 3일 전
      const etdDelivered = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000);
      const etaDelivered = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      const docClosingDelivered = new Date(etdDelivered.getTime() - 3 * 24 * 60 * 60 * 1000);
      const cargoClosingDelivered = new Date(etdDelivered.getTime() - 1 * 24 * 60 * 60 * 1000);

      await Shipment.bulkCreate([
        {
          export_no: 'EK-260901',
          vessel_name: 'MSC DIANA',
          voyage: 'GO634N',
          carrier: 'MSC',
          pol: 'KRPUS',
          pod: 'USLGB',
          etd: etdTransit.toISOString().split('T')[0],
          eta: etaTransit.toISOString().split('T')[0],
          doc_closing_date: docClosingTransit,
          cargo_closing_date: cargoClosingTransit,
          vessel_imo: '9755933',
          shipper: 'NEXUS ELECTRONICS CO., LTD.',
          consignee: 'GLOBAL DYNAMICS INC.',
          item_summary: 'EDT Module x 450, Main Frame x 200 (총 24 CBM / 4,850 kg)'
        },
        {
          export_no: 'EK-260902',
          vessel_name: 'MSC GULSUN',
          voyage: '2401E',
          carrier: 'MSC',
          pol: 'KRINC',
          pod: 'USLAX',
          etd: etdPending.toISOString().split('T')[0],
          eta: etaPending.toISOString().split('T')[0],
          doc_closing_date: docClosingPending,
          cargo_closing_date: cargoClosingPending,
          vessel_imo: '9839438',
          shipper: 'NEXUS ELECTRONICS CO., LTD.',
          consignee: 'PACIFIC CARGO LOGISTICS',
          item_summary: 'CC360 Assembly x 320, Sensor Units x 150 (총 18 CBM / 3,200 kg)'
        },
        {
          export_no: 'EK-260815',
          vessel_name: 'MSC SIXIN',
          voyage: '2403E',
          carrier: 'MSC',
          pol: 'KRPUS',
          pod: 'NLRTM',
          etd: etdDelivered.toISOString().split('T')[0],
          eta: etaDelivered.toISOString().split('T')[0],
          doc_closing_date: docClosingDelivered,
          cargo_closing_date: cargoClosingDelivered,
          vessel_imo: '9839440',
          shipper: 'NEXUS ELECTRONICS CO., LTD.',
          consignee: 'EUROPEAN DISTRIBUTION HUB',
          item_summary: 'iDT Controller x 600, Repair Kits x 80 (총 32 CBM / 6,100 kg)'
        }
      ]);
      console.log('✅ [Shipment Seed] 초기 출고 트래킹 샘플 데이터 3건이 생성되었습니다.');
    }
  } catch (err) {
    console.error('Shipment Seed Error:', err.message);
  }
}

// GET /tracking/all - 전체 출고건 트래킹 목록 조회
router.get('/all', async (req, res) => {
  try {
    await ensureSeedShipments();
    const shipments = await Shipment.findAll({
      order: [['createdAt', 'DESC']]
    });

    const enriched = shipments.map(s => computeShipmentStatus(s));

    res.json({
      success: true,
      data: enriched,
      total: enriched.length
    });
  } catch (error) {
    console.error('트래킹 전체 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '트래킹 목록을 불러오는 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// GET /tracking/:exportNo - 특정 출고번호 상세 조회
router.get('/:exportNo', async (req, res) => {
  try {
    const { exportNo } = req.params;
    const shipment = await Shipment.findOne({
      where: { export_no: exportNo }
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: `출고번호 '${exportNo}'에 해당하는 트래킹 데이터를 찾을 수 없습니다.`
      });
    }

    const enriched = computeShipmentStatus(shipment);

    res.json({
      success: true,
      data: enriched
    });
  } catch (error) {
    console.error('트래킹 상세 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '트래킹 정보를 불러오는 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// POST /tracking/sync-export - Export 화면에서 출고 정보 저장 시 자동 동기화
router.post('/sync-export', async (req, res) => {
  try {
    const {
      export_no,
      vessel_name,
      voyage,
      carrier = 'MSC',
      pol = 'KRPUS',
      pod = 'USLGB',
      etd,
      eta,
      doc_closing_date,
      cargo_closing_date,
      vessel_imo,
      item_summary
    } = req.body;

    if (!export_no || !export_no.trim()) {
      return res.status(400).json({
        success: false,
        message: '출고 넘버(export_no)는 필수입니다.'
      });
    }

    const cleanExportNo = export_no.trim();

    // 기존 데이터 존재 여부 확인
    let shipment = await Shipment.findOne({ where: { export_no: cleanExportNo } });

    const payload = {
      export_no: cleanExportNo,
      vessel_name: vessel_name || 'MSC VESSEL',
      voyage: voyage || 'V001',
      carrier: carrier || 'MSC',
      pol: pol || 'KRPUS',
      pod: pod || 'USLGB',
      etd: etd ? etd.split('T')[0] : null,
      eta: eta ? eta.split('T')[0] : null,
      doc_closing_date: doc_closing_date ? new Date(doc_closing_date) : null,
      cargo_closing_date: cargo_closing_date ? new Date(cargo_closing_date) : null,
      vessel_imo: vessel_imo || null,
      item_summary: item_summary || '출하 품목 등록 건'
    };

    if (shipment) {
      await shipment.update(payload);
    } else {
      shipment = await Shipment.create(payload);
    }

    const enriched = computeShipmentStatus(shipment);

    res.json({
      success: true,
      message: `출고 건 [${cleanExportNo}]이(가) 트래킹 시스템에 성공적으로 등록/동기화되었습니다.`,
      data: enriched
    });
  } catch (error) {
    console.error('Export 트래킹 동기화 실패:', error);
    res.status(500).json({
      success: false,
      message: '출고 트래킹 동기화 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

module.exports = router;
