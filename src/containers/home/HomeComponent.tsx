import React from 'react';
import { MRPItemResult } from '../../lib/utils/calculateMRP';
import { TrackingShipment } from '../../lib/api/tracking';

interface Props {
  fromCurrency: string;
  resultCurrency: { [key: string]: { [key: string]: number } } | null;
  selectedMonth: string;
  accumulatedMonths: string[];
  availableMonths: string[];
  onSelectMonth: (month: string) => void;
  fxRates: { usd: number; eur: number; jpy: number; cny: number } | null;
  shortageStats: {
    dangerCount: number;
    warningCount: number;
    normalCount: number;
    list: MRPItemResult[];
  };
  exportStats: {
    totalQty: number;
    totalAmountUSD: number;
    list: { name: string; qty: number; exPrice: number; subtotalUSD: number }[];
  };
  shipmentStats: {
    inTransit: number;
    loaded: number;
    pending: number;
    delivered: number;
    list: TrackingShipment[];
  };
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdatedTime: string;
  onNavigate: (path: string) => void;
}

const HomeComponent: React.FC<Props> = ({
  selectedMonth,
  accumulatedMonths,
  availableMonths,
  onSelectMonth,
  fxRates,
  shortageStats,
  exportStats,
  shipmentStats,
  onRefresh,
  isRefreshing,
  lastUpdatedTime,
  onNavigate,
}) => {
  return (
    <div className="dashboard-container">
      {/* =================================================================== */}
      {/* 1. 실시간 글로벌 외환 지표 (Global FX Market Overview) */}
      {/* =================================================================== */}
      <section className="fx-section">
        <div className="section-title-wrap">
          <h2 className="sec-title">글로벌 주요 통화 환율 지표 (KRW 기준)</h2>
          <div className="sec-actions">
            <span className="sec-meta">최종 동기화 시각: {lastUpdatedTime || '-'}</span>
            <button
              type="button"
              className="btn-refresh"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? '데이터 갱신 중...' : '데이터 갱신'}
            </button>
          </div>
        </div>

        <div className="fx-cards-grid">
          {/* USD Card */}
          <div className="fx-card usd">
            <div className="fx-card-head">
              <span className="currency-code">USD ($)</span>
              <span className="currency-name">미국 달러</span>
            </div>
            <div className="fx-rate-value">
              <span className="krw-unit">￦</span>
              {fxRates ? Number(fxRates.usd.toFixed(2)).toLocaleString() : '1,385.00'}
            </div>
            <div className="fx-card-footer">
              <span>수출입 결제 기준 통화</span>
              <span>1 USD 환산</span>
            </div>
          </div>

          {/* EUR Card */}
          <div className="fx-card eur">
            <div className="fx-card-head">
              <span className="currency-code">EUR (€)</span>
              <span className="currency-name">유럽 유로</span>
            </div>
            <div className="fx-rate-value">
              <span className="krw-unit">￦</span>
              {fxRates ? Number(fxRates.eur.toFixed(2)).toLocaleString() : '1,512.00'}
            </div>
            <div className="fx-card-footer">
              <span>EU 권역 결제 통화</span>
              <span>1 EUR 환산</span>
            </div>
          </div>

          {/* JPY Card */}
          <div className="fx-card jpy">
            <div className="fx-card-head">
              <span className="currency-code">JPY (100¥)</span>
              <span className="currency-name">일본 엔화</span>
            </div>
            <div className="fx-rate-value">
              <span className="krw-unit">￦</span>
              {fxRates ? Number(fxRates.jpy.toFixed(2)).toLocaleString() : '925.00'}
            </div>
            <div className="fx-card-footer">
              <span>정밀 부품 수입 결제</span>
              <span>100 JPY 환산</span>
            </div>
          </div>

          {/* CNY Card */}
          <div className="fx-card cny">
            <div className="fx-card-head">
              <span className="currency-code">CNY (¥)</span>
              <span className="currency-name">중국 위안화</span>
            </div>
            <div className="fx-rate-value">
              <span className="krw-unit">￦</span>
              {fxRates ? Number(fxRates.cny.toFixed(2)).toLocaleString() : '192.00'}
            </div>
            <div className="fx-card-footer">
              <span>기구/원자재 공급망 결제</span>
              <span>1 CNY 환산</span>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 2 & 3. 2단 운영 현황 위젯 (자재 결품 모니터링 vs 완제품 수출 출하 현황) */}
      {/* =================================================================== */}
      <div className="dual-widgets-grid">
        {/* 좌측: 자재 결품 및 안전재고 조달 현황 */}
        <div className="widget-panel">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <h3 className="panel-title">
                자재 결품 및 안전재고 모니터링 ({accumulatedMonths.length > 1 ? `${accumulatedMonths[0]}~${accumulatedMonths[accumulatedMonths.length - 1]} 누적` : `${selectedMonth} 기준`})
              </h3>
              {shortageStats.dangerCount > 0 && (
                <span className="badge-danger">발주긴급: {shortageStats.dangerCount}건</span>
              )}
              {shortageStats.warningCount > 0 && (
                <span className="badge-warning">안전주의: {shortageStats.warningCount}건</span>
              )}
              {shortageStats.dangerCount === 0 && shortageStats.warningCount === 0 && (
                <span className="badge-normal">전 부품 정상 (결품 없음)</span>
              )}
            </div>
            <button
              type="button"
              className="btn-link-action"
              onClick={() => onNavigate('/view')}
            >
              자재마스터 관리 [이동] ➔
            </button>
          </div>

          {/* 기준월 누적 선택 툴바 */}
          <div className="shortage-month-toolbar">
            <div className="month-selector-group">
              <span className="selector-label">기준월 (누적):</span>
              {availableMonths.map((m) => {
                const isAccumulated = accumulatedMonths.includes(m);
                const isCurrentEnd = selectedMonth === m;
                return (
                  <button
                    key={m}
                    type="button"
                    className={`btn-month-tab ${isAccumulated ? 'accumulated' : ''} ${isCurrentEnd ? 'active' : ''}`}
                    onClick={() => onSelectMonth(m)}
                    title={`${availableMonths[0]} ~ ${m} 누적 소요량 반영`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
            <span className="cumulative-badge">
              {accumulatedMonths.length > 1
                ? `${accumulatedMonths[0]} ~ ${accumulatedMonths[accumulatedMonths.length - 1]} 누적 (${accumulatedMonths.length}개월)`
                : `${accumulatedMonths[0]} 당월 (1개월)`}
            </span>
          </div>

          <div className="panel-body">
            {shortageStats.list.length > 0 ? (
              <div className="shortage-table-wrap">
                <table className="shortage-table">
                  <thead>
                    <tr>
                      <th style={{ width: '65px' }}>상태</th>
                      <th>부품명</th>
                      <th style={{ width: '55px' }}>분류</th>
                      <th style={{ width: '70px', textAlign: 'right' }}>현재고</th>
                      <th style={{ width: '75px', textAlign: 'right' }}>
                        소요량 ({accumulatedMonths.length > 1 ? `${accumulatedMonths.length}M` : '당월'})
                      </th>
                      <th style={{ width: '75px', textAlign: 'right' }}>순부족량</th>
                      <th style={{ width: '75px', textAlign: 'center' }}>조달상태</th>
                      <th style={{ width: '110px' }}>소진시점</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shortageStats.list.slice(0, 6).map((item) => {
                      const procureBadge =
                        item.rfq_status === 'RFQ_SENT'
                          ? { cls: 'rfq', txt: '견적요청' }
                          : item.rfq_status === 'PO_SENT'
                          ? { cls: 'po', txt: '발주완료' }
                          : item.rfq_status === 'INBOUND'
                          ? { cls: 'inbound', txt: '입고대기' }
                          : { cls: 'idle', txt: '미발주' };

                      return (
                        <tr key={item.id}>
                          <td>
                            <span className={`badge-status ${item.status}`}>
                              {item.status === 'DANGER' ? '발주긴급' : '안전주의'}
                            </span>
                          </td>
                          <td>
                            <b style={{ color: '#0f172a' }}>{item.itemName}</b>
                          </td>
                          <td>
                            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                              {item.category}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>{item.stock.toLocaleString()}</td>
                          <td style={{ textAlign: 'right' }}>{item.grossReq.toLocaleString()}</td>
                          <td style={{ textAlign: 'right' }}>
                            <span className="shortage-qty">
                              {item.shortage > 0 ? `+${item.shortage.toLocaleString()}` : '-'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`procure-badge ${procureBadge.cls}`}>
                              {procureBadge.txt}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            {item.runwayText || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-shortage">
                [정상] {accumulatedMonths.length > 1 ? `${accumulatedMonths[0]}~${accumulatedMonths[accumulatedMonths.length - 1]} 누적` : selectedMonth} 기준 생산 계획에 필요한 모든 원부자재가 안전재고 이상 확보되어 있습니다.
              </div>
            )}
          </div>
        </div>

        {/* 우측: 당월 완제품 수출 출하 현황 */}
        <div className="widget-panel">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <h3 className="panel-title">완제품 수출 출하 계획 ({selectedMonth} 기준)</h3>
            </div>
            <button
              type="button"
              className="btn-link-action"
              onClick={() => onNavigate('/Export')}
            >
              발주관리 [이동] ➔
            </button>
          </div>

          <div className="panel-body">
            {/* 상단 3개 KPI 요약 박스 */}
            <div className="export-kpi-row">
              <div className="kpi-cell">
                <div className="kpi-label">총 출하 예정 수량</div>
                <div className="kpi-val highlight">
                  {exportStats.totalQty.toLocaleString()} SET
                </div>
              </div>
              <div className="kpi-cell">
                <div className="kpi-label">출하 대상 모델</div>
                <div className="kpi-val">{exportStats.list.length} 개 모델</div>
              </div>
              <div className="kpi-cell">
                <div className="kpi-label">예상 수출 총액 (FOB)</div>
                <div className="kpi-val">
                  $ {Number(exportStats.totalAmountUSD.toFixed(0)).toLocaleString()}
                </div>
              </div>
            </div>

            {/* 완제품 수주 명세 테이블 */}
            <div className="export-table-wrap">
              <table className="export-table">
                <thead>
                  <tr>
                    <th>완제품 모델명</th>
                    <th style={{ width: '80px', textAlign: 'right' }}>수주 수량</th>
                    <th style={{ width: '85px', textAlign: 'right' }}>수출단가</th>
                    <th style={{ width: '100px', textAlign: 'right' }}>소계 (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {exportStats.list.length > 0 ? (
                    exportStats.list.map((set, idx) => (
                      <tr key={idx}>
                        <td>
                          <b>{set.name}</b>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <b>{set.qty.toLocaleString()}</b> SET
                        </td>
                        <td style={{ textAlign: 'right', color: '#64748b' }}>
                          $ {set.exPrice.toFixed(1)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                          $ {Number(set.subtotalUSD.toFixed(0)).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                        {selectedMonth}에 등록된 완제품 수주 데이터가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. 해상 운항 선박 및 선적 물류 실시간 관제 (Ocean Vessel Tracking) */}
      {/* =================================================================== */}
      <section className="vessel-section">
        <div className="vessel-header">
          <div className="vessel-title-wrap">
            <h3 className="vessel-title">해상 화물 및 운항 선박 실시간 모니터링</h3>
            <span className="status-pill transit">해상 운송 중: {shipmentStats.inTransit}건</span>
            <span className="status-pill loaded">선적 완료: {shipmentStats.loaded}건</span>
            <span className="status-pill pending">서류 마감 대기: {shipmentStats.pending}건</span>
            <span className="status-pill delivered">도착 완료: {shipmentStats.delivered}건</span>
          </div>
          <button
            type="button"
            className="btn-link-action"
            onClick={() => onNavigate('/Export')}
          >
            수출물류 관리 [이동] ➔
          </button>
        </div>

        <div className="vessel-cards-grid">
          {shipmentStats.list.slice(0, 6).map((shipment) => {
            return (
              <div key={shipment.export_no} className="vessel-card">
                <div className="vessel-card-top">
                  <span className="export-no-badge">{shipment.export_no}</span>
                  <span className={`step-badge ${shipment.statusKey}`}>
                    {shipment.statusLabel} ({shipment.dDayText})
                  </span>
                </div>

                <div className="vessel-identity">
                  <div className="v-name">{shipment.vessel_name || '선박 미정'}</div>
                  <div className="v-voyage">
                    항차: {shipment.voyage || '-'} | 선사: {shipment.carrier || 'MSC'}
                  </div>
                </div>

                <div className="vessel-route-box">
                  <div className="route-ports">
                    <span>{shipment.pol || 'KRPUS'}</span>
                    <span className="arrow">➔</span>
                    <span>{shipment.pod || 'USLGB'}</span>
                  </div>
                  <div className="route-dates">
                    <span>출항(ETD): {shipment.etd || '-'}</span>
                    <span>도착(ETA): {shipment.eta || '-'}</span>
                  </div>
                </div>

                {/* 5단계 물류 진행 텍스트 바 */}
                <div className="vessel-steps-bar">
                  <div className={`step-dot ${shipment.step >= 1 ? (shipment.step === 1 ? 'active' : 'done') : ''}`}>
                    <span>1.서류</span>
                  </div>
                  <span className="step-sep">➔</span>
                  <div className={`step-dot ${shipment.step >= 2 ? (shipment.step === 2 ? 'active' : 'done') : ''}`}>
                    <span>2.CY반입</span>
                  </div>
                  <span className="step-sep">➔</span>
                  <div className={`step-dot ${shipment.step >= 3 ? (shipment.step === 3 ? 'active' : 'done') : ''}`}>
                    <span>3.선적</span>
                  </div>
                  <span className="step-sep">➔</span>
                  <div className={`step-dot ${shipment.step >= 4 ? (shipment.step === 4 ? 'active' : 'done') : ''}`}>
                    <span>4.해상운항</span>
                  </div>
                  <span className="step-sep">➔</span>
                  <div className={`step-dot ${shipment.step >= 5 ? 'active done' : ''}`}>
                    <span>5.도착</span>
                  </div>
                </div>

                <div className="vessel-cargo-summary" title={shipment.item_summary || '적재 품목'}>
                  화물: {shipment.item_summary || '출하 부품 및 조립품 적재'}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default HomeComponent;