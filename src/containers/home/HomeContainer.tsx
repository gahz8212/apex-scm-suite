import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { itemData, itemActions } from '../../store/slices/itemSlice';
import { relateActions } from '../../store/slices/relationSlice';
import { editActions } from '../../store/slices/editSlice';
import { currencyActions, currencyData } from '../../store/slices/currencySlice';
import { OrderAction, OrderData } from '../../store/slices/orderSlice';
import { PageActions } from '../../store/slices/pageSlice';
import { calculateMRP, ALL_ORDER_MONTHS } from '../../lib/utils/calculateMRP';
import { getAllShipments, TrackingShipment } from '../../lib/api/tracking';

import HomeComponent from './HomeComponent';

const HomeContainer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items, relations } = useSelector(itemData);
  const { fromCurrency, resultCurrency } = useSelector(currencyData);
  const { orderData, months } = useSelector(OrderData);

  const [selectedMonth, setSelectedMonth] = useState<string>('Sep');
  const [shipments, setShipments] = useState<TrackingShipment[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');

  // 1. 선박 트래킹 데이터 비동기 조회
  const fetchShipmentData = useCallback(async () => {
    try {
      const data = await getAllShipments();
      if (Array.isArray(data)) {
        setShipments(data);
      }
    } catch (err) {
      console.error('선박 트래킹 데이터 조회 실패:', err);
    }
  }, []);

  // 2. 초기 데이터 일괄 디스패치 및 로드
  useEffect(() => {
    dispatch(itemActions.initForm());
    dispatch(editActions.initForm());
    dispatch(itemActions.getItem());
    dispatch(relateActions.initRelate());
    dispatch(currencyActions.searchCurrency());
    dispatch(OrderAction.getOrderData());
    fetchShipmentData();

    const now = new Date();
    setLastUpdatedTime(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    );
  }, [dispatch, fetchShipmentData]);

  // 3. 사용 가능한 월 목록 동기화
  const availableMonths = useMemo(() => {
    if (months && months.length > 0) {
      return months;
    }
    return ALL_ORDER_MONTHS;
  }, [months]);

  // 3-1. 기준월 누적 목록 산출: 시작월부터 선택된 월까지 순차 누적 (예: Sep ~ Nov)
  const accumulatedMonths = useMemo(() => {
    const endIdx = availableMonths.indexOf(selectedMonth);
    if (endIdx === -1) {
      return [availableMonths[0] || 'Sep'];
    }
    return availableMonths.slice(0, endIdx + 1);
  }, [availableMonths, selectedMonth]);

  useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.includes(selectedMonth)) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  // 4. 수동 새로고침 핸들러
  const handleRefresh = async () => {
    setIsRefreshing(true);
    dispatch(itemActions.getItem());
    dispatch(relateActions.initRelate());
    dispatch(currencyActions.searchCurrency());
    dispatch(OrderAction.getOrderData());
    await fetchShipmentData();

    const now = new Date();
    setLastUpdatedTime(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    );
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  // 5. 주요 4개 통화 실시간 환율 연산
  const fxRates = useMemo(() => {
    if (!resultCurrency) return null;

    const currData = (resultCurrency as any)[fromCurrency] || (resultCurrency as any).krw;
    if (!currData) return null;

    const calcRate = (code: string) => {
      const rate = currData[code];
      if (!rate || rate <= 0) return null;
      return 1 / rate;
    };

    return {
      usd: calcRate('usd') || 1385.0,
      eur: calcRate('eur') || 1512.0,
      jpy: (calcRate('jpy') ? (calcRate('jpy')! * 100) : 925.0), // 100엔 기준
      cny: calcRate('cny') || 192.0,
    };
  }, [resultCurrency, fromCurrency]);

  // 6. 자재 결품 및 안전재고 소진 분석 (MRP 누적 연산)
  const shortageStats = useMemo(() => {
    if (!items || items.length === 0) {
      return { dangerCount: 0, warningCount: 0, normalCount: 0, list: [] };
    }

    const mrpMap = calculateMRP(items, relations, orderData, accumulatedMonths);
    const nonSetItems = Array.from(mrpMap.values()).filter((item) => item.type !== 'SET');

    const dangerList = nonSetItems.filter((i) => i.status === 'DANGER');
    const warningList = nonSetItems.filter((i) => i.status === 'WARNING');
    const normalCount = nonSetItems.filter((i) => i.status === 'NORMAL').length;

    // 결품 우선순위 정렬: 발주긴급(DANGER) ➔ 안전주의(WARNING), 그 안에서는 순부족량 내림차순
    const sortedList = [...dangerList, ...warningList].sort((a, b) => b.shortage - a.shortage);

    return {
      dangerCount: dangerList.length,
      warningCount: warningList.length,
      normalCount,
      list: sortedList,
    };
  }, [items, relations, orderData, accumulatedMonths]);

  // 7. 당월 완제품 수출 출하 통계
  const exportStats = useMemo(() => {
    if (!orderData || orderData.length === 0) {
      return { totalQty: 0, totalAmountUSD: 0, list: [] };
    }

    const itemMap = new Map<string, any>();
    if (items) {
      items.forEach((it) => {
        itemMap.set(it.itemName, it);
        if (it.Good?.groupName) itemMap.set(it.Good.groupName, it);
      });
    }

    let totalQty = 0;
    let totalAmountUSD = 0;
    const list: { name: string; qty: number; exPrice: number; subtotalUSD: number }[] = [];

    orderData.forEach((row: any) => {
      const name = String(row.Item || row.itemName || row.groupName || '');
      if (!name) return;

      const qty = Number(row[selectedMonth]) || 0;
      if (qty <= 0) return;

      const matchedItem = itemMap.get(name);
      const exPrice = Number(matchedItem?.ex_price) || 48.5; // 기본 수출단가
      const subtotalUSD = qty * exPrice;

      totalQty += qty;
      totalAmountUSD += subtotalUSD;
      list.push({
        name,
        qty,
        exPrice,
        subtotalUSD,
      });
    });

    return {
      totalQty,
      totalAmountUSD,
      list,
    };
  }, [orderData, items, selectedMonth]);

  // 8. 해상 운항 선박 및 물류 단계 통계
  const shipmentStats = useMemo(() => {
    const inTransit = shipments.filter((s) => s.statusKey === 'IN_TRANSIT').length;
    const loaded = shipments.filter(
      (s) => s.statusKey === 'LOADED' || s.statusKey === 'TRUCKING_GATE_IN'
    ).length;
    const pending = shipments.filter((s) => s.statusKey === 'PENDING_DOCS').length;
    const delivered = shipments.filter((s) => s.statusKey === 'DELIVERED').length;

    return {
      inTransit,
      loaded,
      pending,
      delivered,
      list: shipments,
    };
  }, [shipments]);

  // 9. 네비게이션 핸들러 (Redux pageSlice 상태 및 라우터 동시 갱신)
  const handleNavigate = useCallback(
    (destination: string) => {
      if (destination === '/item-management' || destination === '/view' || destination === 'View') {
        dispatch(PageActions.changePage('View'));
        navigate('/view');
      } else if (
        destination === '/ordersheet' ||
        destination === '/export' ||
        destination === '/Export' ||
        destination === 'Export'
      ) {
        dispatch(PageActions.changePage('Export'));
        navigate('/Export');
      } else if (destination === '/tracking' || destination === '/Tracking' || destination === 'Tracking') {
        dispatch(PageActions.changePage('Tracking'));
        navigate('/Tracking');
      } else if (destination === '/settings' || destination === 'Settings') {
        dispatch(PageActions.changePage('Settings'));
        navigate('/settings');
      } else {
        navigate(destination);
      }
    },
    [dispatch, navigate]
  );

  return (
    <HomeComponent
      fromCurrency={fromCurrency}
      resultCurrency={resultCurrency}
      selectedMonth={selectedMonth}
      accumulatedMonths={accumulatedMonths}
      availableMonths={availableMonths}
      onSelectMonth={setSelectedMonth}
      fxRates={fxRates}
      shortageStats={shortageStats}
      exportStats={exportStats}
      shipmentStats={shipmentStats}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      lastUpdatedTime={lastUpdatedTime}
      onNavigate={handleNavigate}
    />
  );
};

export default HomeContainer;