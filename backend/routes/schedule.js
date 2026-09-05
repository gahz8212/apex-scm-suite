const express = require('express');
const router = express.Router();
const { fetchMscSchedule } = require('../services/mscService');

// GET /schedule/ports - 자주 사용하는 주요 항구 목록
router.get('/ports', (req, res) => {
  res.json({
    success: true,
    data: {
      pols: [
        { code: 'KRPUS', name: 'BUSAN (부산)' },
        { code: 'KRINC', name: 'INCHEON (인천)' },
        { code: 'CNSHA', name: 'SHANGHAI (상하이)' },
      ],
      pods: [
        { code: 'USLGB', name: 'LONG BEACH (롱비치)' },
        { code: 'USLAX', name: 'LOS ANGELES (LA)' },
        { code: 'USSEA', name: 'SEATTLE (시애틀)' },
        { code: 'NLRTM', name: 'ROTTERDAM (로테르담)' },
      ]
    }
  });
});

// GET /schedule/search?pol=KRPUS&pod=USLGB&token=...
router.get('/search', async (req, res) => {
  try {
    const { pol = 'KRPUS', pod = 'USLGB', token } = req.query;
    if (!pol || !pod) {
      return res.status(400).json({
        success: false,
        message: '출발항(pol)과 도착항(pod)은 필수입니다.'
      });
    }

    const schedules = await fetchMscSchedule(pol, pod, token);
    res.json({
      success: true,
      data: schedules,
      total: schedules.length,
      isFallback: schedules[0]?.isFallback || false
    });
  } catch (error) {
    console.error('스케줄 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '스케줄 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// POST /schedule/msc (Body: { pol, pod, token })
router.post('/msc', async (req, res) => {
  try {
    const { pol = 'KRPUS', pod = 'USLGB', token } = req.body;
    if (!pol || !pod) {
      return res.status(400).json({
        success: false,
        message: '출발항(pol)과 도착항(pod)은 필수입니다.'
      });
    }

    const schedules = await fetchMscSchedule(pol, pod, token);
    res.json({
      success: true,
      data: schedules,
      total: schedules.length,
      isFallback: schedules[0]?.isFallback || false
    });
  } catch (error) {
    console.error('스케줄 수집 에러:', error);
    res.status(500).json({
      success: false,
      message: '스케줄 수집 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

module.exports = router;
