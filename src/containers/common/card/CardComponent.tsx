import React, { useState, useMemo } from 'react';
import { formatCurrencySymbol } from '../../../lib/utils/formatCurrency';
import { calculateMRP, MRPItemResult } from '../../../lib/utils/calculateMRP';

type Props = {
  items: {
    id: number;
    type: string;
    category: string;
    itemName: string;
    descript: string;
    unit: string;
    sum_im_price: number;
    im_price: number;
    ex_price: number;
    use: boolean;
    supplyer: string;
    stock?: number;
    safety_stock?: number;
    lead_time?: string;
    suppliers?: any;
    rfq_status?: string;
    selected_supplier?: string;
    Images: { url: string }[];
    Good?: { groupName: string };
    left: number;
    top: number;
    point: number;
  }[] | null;
  selectItem: (id: number) => void;
  dragItem: (id: number) => void;
  onDrop: () => void;
  viewMode: boolean;
  relations: { UpperId: number; LowerId: number; point?: number }[] | null;
  showRelate: (id: number, type: string, event: any, visible: boolean) => void;
  totalPrice: { [key: number]: number } | undefined;
  orderData?: any[] | null;
  onUpdateRfqStatus?: (id: number, rfq_status: string, selected_supplier?: string) => void;
  isItemMaster?: boolean;
};

const CardComponent: React.FC<Props> = ({
  items,
  selectItem,
  dragItem,
  onDrop,
  viewMode,
  relations,
  showRelate,
  totalPrice,
  orderData = null,
  onUpdateRfqStatus,
  isItemMaster = false,
}) => {
  const [selected, setSelected] = useState<number | ''>();
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [isAllFlipped, setIsAllFlipped] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState<string[]>(['Sep']);

  // 모달 상태
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    itemName: string;
    type: string;
    category: string;
  } | null>(null);

  const [rfqModalItem, setRfqModalItem] = useState<MRPItemResult | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<string>('');

  const [poModalItem, setPoModalItem] = useState<MRPItemResult | null>(null);

  // 1. 실시간 MRP 소요량 & 재고 예측 계산 (다중 월 누적 & 재고 소진 시점 연산)
  const mrpMap = useMemo(() => {
    return calculateMRP(items as any, relations as any, orderData, selectedMonths);
  }, [items, relations, orderData, selectedMonths]);

  // 2. 전체 뒤집기 토글
  const handleToggleFlipAll = () => {
    const nextState = !isAllFlipped;
    setIsAllFlipped(nextState);
    if (nextState) {
      setFlippedCards(new Set(items?.map((i) => i.id) || []));
    } else {
      setFlippedCards(new Set());
    }
  };

  // 3. 개별 카드 뒤집기 토글
  const handleToggleCardFlip = (id: number) => {
    const next = new Set(flippedCards);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setFlippedCards(next);
    setIsAllFlipped(next.size === (items?.length || 0) && next.size > 0);
  };

  // 4. 기준 월 다중 토글 핸들러
  const handleToggleMonth = (m: string) => {
    const allOrder = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
    if (selectedMonths.includes(m)) {
      if (selectedMonths.length > 1) {
        setSelectedMonths(selectedMonths.filter((x) => x !== m));
      }
    } else {
      const next = [...selectedMonths, m].sort(
        (a, b) => allOrder.indexOf(a) - allOrder.indexOf(b)
      );
      setSelectedMonths(next);
    }
  };

  // 5. DT 품명 추출 헬퍼 (완제품: groupName 우선, 부품: itemName)
  const getDisplayItemName = (item: any) => {
    if (item.type === 'SET' && item.Good?.groupName) {
      return item.Good.groupName;
    }
    return item.itemName || '';
  };

  // 6. 퀵 서머리 카운트
  const summaryCounts = useMemo(() => {
    let danger = 0;
    let warning = 0;
    let normal = 0;
    mrpMap.forEach((mrp) => {
      if (mrp.status === 'DANGER') danger++;
      else if (mrp.status === 'WARNING') warning++;
      else normal++;
    });
    return { total: mrpMap.size, danger, warning, normal };
  }, [mrpMap]);

  // RFQ 제출 핸들러
  const handleRfqSubmit = () => {
    if (!rfqModalItem) return;
    const vendor = selectedVendor || rfqModalItem.selected_supplier || rfqModalItem.supplyer;
    if (onUpdateRfqStatus) {
      onUpdateRfqStatus(rfqModalItem.id, 'RFQ_SENT', vendor);
    }
    alert(`[${rfqModalItem.itemName}]\n${vendor}에 견적요청서(RFQ)가 성공적으로 발송되었습니다.\n(카드 상태가 '2단계: 발주서 발행'으로 자동 전환됩니다.)`);
    setRfqModalItem(null);
  };

  // PO 발주 제출 핸들러
  const handlePoSubmit = () => {
    if (!poModalItem) return;
    const vendor = poModalItem.selected_supplier || poModalItem.supplyer;
    if (onUpdateRfqStatus) {
      onUpdateRfqStatus(poModalItem.id, 'PO_SENT', vendor);
    }
    alert(`[${poModalItem.itemName}]\n${vendor}에 정식 발주서(PO)가 발행되어 전송되었습니다.\n(상태가 '3단계: 입고 대기중'으로 전환됩니다.)`);
    setPoModalItem(null);
  };

  return (
    <div className="item-list-container">
      {/* ------------------------------------------------------------------ */}
      {/* 1. 상단 MRP & 카드 일괄 제어 툴바 (viewMode가 아닐 때 표시)        */}
      {/* ------------------------------------------------------------------ */}
      {!viewMode && (
        <div className="card-control-toolbar">
          <div className="toolbar-left">
            <button
              type="button"
              className={`btn-flip-all ${isAllFlipped ? 'active' : ''}`}
              onClick={handleToggleFlipAll}
              title="모든 카드를 180도 일제히 뒤집어 MRP 재고예측 화면으로 전환합니다"
            >
              <span className="icon">{isAllFlipped ? '📦' : '🔄'}</span>
              <span>{isAllFlipped ? '전체 앞면 (단가/BOM 뷰)' : '전체 뒤집기 (MRP 재고예측 뷰)'}</span>
            </button>

            {/* 기준 월(Month) 다중 선택 탭 (전체5M 제외, '월' 텍스트 제외) */}
            <div className="month-tabs-group">
              <span className="month-label">기준:</span>
              {['Sep', 'Oct', 'Nov', 'Dec', 'Jan'].map((m) => {
                const isActive = selectedMonths.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    className={`month-tab ${isActive ? 'active' : ''}`}
                    onClick={() => handleToggleMonth(m)}
                    title={`${m} 오더 소요량 토글`}
                  >
                    {m}
                  </button>
                );
              })}
              {selectedMonths.length > 1 && (
                <span className="month-period-tag" title="선택된 월들의 누적 소요량 및 소진 시점 분석">
                  {selectedMonths.length}M 누적
                </span>
              )}
            </div>
          </div>

          <div className="toolbar-right">
            <span className="summary-badge total">총 {summaryCounts.total}개 품목</span>
            {summaryCounts.danger > 0 && (
              <span className="summary-badge danger">🚨 긴급 {summaryCounts.danger}</span>
            )}
            {summaryCounts.warning > 0 && (
              <span className="summary-badge warning">⚠️ 주의 {summaryCounts.warning}</span>
            )}
            <span className="summary-badge normal">✅ 정상 {summaryCounts.normal}</span>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 2. 카드 목록 그리드 (viewMode일 때는 BOM 계층 트리 좌표로 absolute 렌더링) */}
      {/* ------------------------------------------------------------------ */}
      {(() => {
        // 커진 카드 규격(230px × 230px, Item Master와 동일)에 대응한 배율
        const SCALE_X = 2.4;
        const SCALE_Y = 2.5;

        // 첫째줄 기준 최소 top
        const minTop = items && items.length > 0 ? Math.min(...items.map((i) => i.top ?? 0)) : 15;

        const maxTop = items && items.length > 0
          ? Math.max(900, ...items.map((i) => ((i.top ?? 0) * SCALE_Y) + 320))
          : 900;
        const maxLeft = items && items.length > 0
          ? Math.max(1300, ...items.map((i) => (((i.left ?? 0) * SCALE_X) - 80) + 320))
          : 1300;

        const containerStyle: React.CSSProperties = viewMode
          ? {
              position: 'relative',
              width: '100%',
              minHeight: `${maxTop}px`,
              minWidth: `${maxLeft}px`,
            }
          : {};

        return (
          <div className={`item-list ${viewMode ? 'view-mode' : ''}`} style={containerStyle}>
            {items?.map((item) => {
              const mrp = mrpMap.get(item.id);
              const isFlipped = flippedCards.has(item.id);
              const hasImage = item.Images && item.Images.length > 0 && Boolean(item.Images[0].url);
              const dtName = getDisplayItemName(item);

              // 첫째줄: 위로 50px 이동 (X는 -50 유지)
              // 둘째줄부터: 왼쪽으로 30px 추가 이동 (기존 -50에서 -30 ➔ -80px)
              const isFirstRow = (item.top ?? 0) <= minTop + 10;
              const cardLeft = isFirstRow
                ? ((item.left ?? 0) * SCALE_X) - 50
                : ((item.left ?? 0) * SCALE_X) - 80;
              const cardTop = isFirstRow
                ? Math.max(8, ((item.top ?? 0) * SCALE_Y) - 50)
                : (item.top ?? 0) * SCALE_Y;

              const cardStyle: React.CSSProperties = viewMode
                ? {
                    position: 'absolute',
                    left: cardLeft,
                    top: cardTop,
                    zIndex: selected === item.id ? 10 : 2,
                  }
                : {};

              return (
                <div
                  key={item.id}
                  className={`infos ${selected === item.id ? 'selected' : ''} ${
                    isFlipped ? 'is-flipped' : ''
                  } ${item.category} ${item.type} ${viewMode ? 'absolute' : 'relative'}`}
                  style={cardStyle}
                  onClick={() => setSelected(item.id)}
                  draggable
                  onDragStart={(e) => {
                    dragItem(item.id);
                    const img = new Image();
                    img.src = './images/package.png';
                    e.dataTransfer.setDragImage(img, 50, 50);
                    e.dataTransfer.setData(
                      'pickedItem',
                      JSON.stringify({
                        ItemId: item.id,
                        itemName: item.itemName,
                        unit: item.unit,
                        im_price: item.im_price,
                        ex_price: item.ex_price,
                        type: item.type,
                      })
                    );
                  }}
                  onDragEnd={onDrop}
                >
                  {/* BOM viewMode 시 하위 품목 소요량 배율 뱃지 (원복) */}
                  {viewMode && item.type !== 'SET' && (item.point ?? 0) > 0 && (
                    <div className="badge" title={`소요 수량: x${item.point}`}>
                      <div className="point">x{item.point}</div>
                    </div>
                  )}

                  {/* ============================================================== */}
                  {/* [카드 앞면]: 단가 & 스펙 마스터 뷰                             */}
                  {/* ============================================================== */}
              <div className="info front">
                {/* 1. 상단 헤더 스트립 (카메라 버튼은 하단으로 이동) */}
                <div className="card-header-strip">
                  <div className="badge-group">
                    <span className={`type-badge ${item.type}`}>{item.type}</span>
                    <span className="cat-chip">{item.category}</span>
                  </div>
                </div>

                {/* 2. DT 품명 & 규격 */}
                <div className="item-identity" title={`${item.itemName} (${item.descript || ''})`}>
                  <div className="dt-name">{dtName}</div>
                  <div className="spec-desc">{item.descript || item.itemName}</div>
                </div>

                {/* 3. 단가 미니 박스 (입고원가나 합산원가가 0이면 아예 표시하지 않고 유효 가격만 가로배치) */}
                {(() => {
                  const rollupPrice = totalPrice && totalPrice[item.id] > 0
                    ? totalPrice[item.id]
                    : (item.type !== 'PARTS' ? (item.im_price || 0) : 0);

                  const priceCells = [];

                  // 1) 입고원가: 0보다 클 때만 표시 (0이면 아예 제외)
                  if ((item.im_price || 0) > 0) {
                    priceCells.push(
                      <div key="im" className="price-cell">
                        <span className="label">입고원가</span>
                        <span className="val">
                          {formatCurrencySymbol(item.unit)}{(item.im_price || 0).toLocaleString()}
                        </span>
                      </div>
                    );
                  }

                  // 2) 합산원가: 0보다 클 때만 표시 (0이면 아예 제외)
                  if ((rollupPrice || 0) > 0) {
                    priceCells.push(
                      <div key="rollup" className="price-cell highlight">
                        <span className="label">합산원가</span>
                        <span className="val">
                          {formatCurrencySymbol(item.unit)}{rollupPrice.toLocaleString()}
                        </span>
                      </div>
                    );
                  }

                  // 3) 수출가: 항상 표시 (또는 다른 가격이 없을 때도 표시)
                  priceCells.push(
                    <div key="ex" className="price-cell">
                      <span className="label">수출가</span>
                      <span className="val">${item.ex_price ? item.ex_price.toFixed(2) : '0.00'}</span>
                    </div>
                  );

                  return (
                    <div
                      className="price-metrics-box"
                      style={{
                        gridTemplateColumns: `repeat(${priceCells.length}, 1fr)`,
                      }}
                    >
                      {priceCells}
                    </div>
                  );
                })()}

                {/* 4. 하단 액션 버튼 바: [edit] ➔ [mrp] ➔ [카메라] 순서 (bom 삭제) */}
                <div className="card-footer-actions">
                  <button
                    type="button"
                    className="btn-action-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectItem(item.id);
                      setSelected(item.id);
                    }}
                    title="품목 정보 수정 (Edit)"
                  >
                    <span className="material-symbols-outlined icon">edit</span>
                  </button>

                  <button
                    type="button"
                    className="btn-action-icon btn-flip"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleCardFlip(item.id);
                    }}
                    title="MRP 재고예측 (카드 뒤집기)"
                  >
                    <span className="material-symbols-outlined icon">sync_alt</span>
                  </button>

                  <button
                    type="button"
                    className={`btn-action-icon photo-btn ${hasImage ? 'has-photo' : 'no-photo'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasImage) {
                        setPreviewImage({
                          url: item.Images[0].url,
                          itemName: item.itemName,
                          type: item.type,
                          category: item.category,
                        });
                      }
                    }}
                    title={hasImage ? '고해상도 실물/도면 사진 보기' : '등록된 이미지가 없습니다'}
                  >
                    <span className="material-symbols-outlined icon">photo_camera</span>
                  </button>
                </div>
              </div>

              {/* ============================================================== */}
              {/* [카드 뒷면]: MRP 재고예측 뷰 (견적/발주 버튼 삭제, 깔끔한 3열+잔여 배치) */}
              {/* ============================================================== */}
              <div className="info back">
                {/* 1. 뒷면 헤더 & 미니 썸네일 */}
                <div className="back-header">
                  <div className="back-title-wrap">
                    <span className="back-badge">[{item.type}] 재고예측</span>
                    <span className="back-item-name" title={item.itemName}>
                      {dtName}
                    </span>
                  </div>

                  <div
                    className="thumb-preview"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasImage) {
                        setPreviewImage({
                          url: item.Images[0].url,
                          itemName: item.itemName,
                          type: item.type,
                          category: item.category,
                        });
                      }
                    }}
                    title={hasImage ? '클릭하여 사진 확대' : '이미지 없음'}
                  >
                    {hasImage ? (
                      <img src={item.Images[0].url} alt="" />
                    ) : (
                      <span className="no-img-text">No Img</span>
                    )}
                  </div>
                </div>

                {/* 2. 재고 지표: Item Master에서는 수정 전 상태(소요, 현재고, 안전, 예상잔여) 복원, BOM에서는 현재고/안전재고만 표시 */}
                {isItemMaster ? (
                  <div className="mrp-table-block">
                    <div className="mrp-col-grid">
                      <div className="mrp-col-cell">
                        <span className="cell-hdr">소요</span>
                        <span className="cell-val">
                          {item.type === 'SET'
                            ? '-'
                            : mrp
                            ? `${mrp.grossReq.toLocaleString()}`
                            : '0'}
                        </span>
                      </div>
                      <div className="mrp-col-cell">
                        <span className="cell-hdr">현재고</span>
                        <span className="cell-val">
                          {mrp ? mrp.stock.toLocaleString() : (item.stock || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="mrp-col-cell">
                        <span className="cell-hdr">안전</span>
                        <span className="cell-val">
                          {mrp ? mrp.safety_stock.toLocaleString() : (item.safety_stock || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* 예상잔여 */}
                    <div className="mrp-forecast-block">
                      <span className="forecast-hdr">예상잔여</span>
                      <span
                        className={`forecast-num ${
                          mrp?.status === 'DANGER'
                            ? 'danger'
                            : mrp?.status === 'WARNING'
                            ? 'warning'
                            : 'normal'
                        }`}
                        style={{
                          fontWeight: 700,
                          fontSize: '0.98rem',
                          color:
                            mrp?.status === 'DANGER'
                              ? '#dc2626'
                              : mrp?.status === 'WARNING'
                              ? '#d97706'
                              : '#16a34a',
                        }}
                      >
                        {mrp && mrp.expectedBalance > 0
                          ? `+${mrp.expectedBalance.toLocaleString()}`
                          : mrp
                          ? mrp.expectedBalance.toLocaleString()
                          : 0}{' '}
                        {item.type === 'SET' ? 'SET' : 'EA'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="stock-metrics-block">
                    <div className="stock-col-grid">
                      <div className="stock-col-cell">
                        <span className="cell-hdr">현재고</span>
                        <span className="cell-val">
                          {(mrp ? mrp.stock : (item.stock || 0)).toLocaleString()} {item.type === 'SET' ? 'SET' : 'EA'}
                        </span>
                      </div>
                      <div className="stock-col-cell">
                        <span className="cell-hdr">안전재고</span>
                        <span className="cell-val">
                          {(mrp ? mrp.safety_stock : (item.safety_stock || 0)).toLocaleString()} {item.type === 'SET' ? 'SET' : 'EA'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. 하단 전면 [앞면으로 돌아가기] 버튼 (견적, 발주 버튼 삭제) */}
                <div className="flip-back-bar">
                  <button
                    type="button"
                    className="btn-flip-back"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleCardFlip(item.id);
                    }}
                  >
                    <span>↩️ 앞면</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  })()}

      {/* ==================================================================== */}
      {/* 3. 고해상도 이미지 라이트박스 팝업 (Image Lightbox Modal)           */}
      {/* ==================================================================== */}
      {previewImage && (
        <div className="image-lightbox-overlay" onClick={() => setPreviewImage(null)}>
          <div className="lightbox-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span className="material-symbols-outlined" style={{ color: '#2563eb' }}>
                  image
                </span>
                <h4>{previewImage.itemName}</h4>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setPreviewImage(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <img src={previewImage.url} alt={previewImage.itemName} />
            </div>
            <div className="modal-footer">
              <span>
                분류: <b>{previewImage.type}</b> / <b>{previewImage.category}</b>
              </span>
              <span>ESC 키 또는 바깥 영역 클릭 시 닫힙니다</span>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. 견적요청(RFQ) 복수 벤더 선택 모달                                 */}
      {/* ==================================================================== */}
      {rfqModalItem && (
        <div className="procure-modal-overlay" onClick={() => setRfqModalItem(null)}>
          <div className="procure-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <span className="title">📋 견적요청서(RFQ) 작성</span>
              <button
                type="button"
                className="close-btn"
                onClick={() => setRfqModalItem(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-content">
              <div className="summary-box">
                <div className="row">
                  <span className="k">대상 품목:</span>
                  <span className="v">{rfqModalItem.itemName}</span>
                </div>
                <div className="row">
                  <span className="k">{selectedMonths.join('+')} 필요소요:</span>
                  <span className="v">{rfqModalItem.grossReq.toLocaleString()} EA</span>
                </div>
                <div className="row">
                  <span className="k">현재고 / 예상부족:</span>
                  <span className="v">
                    {rfqModalItem.stock.toLocaleString()} EA /{' '}
                    <span style={{ color: '#dc2626' }}>-{Math.abs(rfqModalItem.expectedBalance).toLocaleString()} EA</span>
                  </span>
                </div>
                <div className="row">
                  <span className="k">권장 견적요청 수량:</span>
                  <span className="v highlight">{rfqModalItem.suggestedPo.toLocaleString()} EA (MOQ 반영)</span>
                </div>
              </div>

              <div className="section-label">견적 대상 거래처 선택 (복수 공급처):</div>
              <div className="vendors-list">
                {rfqModalItem.suppliers && rfqModalItem.suppliers.length > 0 ? (
                  rfqModalItem.suppliers.map((sup, idx) => {
                    const isChecked = (selectedVendor || rfqModalItem.supplyer) === sup.name;
                    return (
                      <div
                        key={idx}
                        className={`vendor-item ${isChecked ? 'selected' : ''}`}
                        onClick={() => setSelectedVendor(sup.name)}
                      >
                        <span className="radio-box">{isChecked ? '🔘' : '⚪'}</span>
                        <div className="v-info">
                          <span className="v-name">{sup.name} {idx === 0 ? '(메인 대리점)' : '(서브 납품처)'}</span>
                          <span className="v-meta">
                            기준단가: ￦{sup.price?.toLocaleString()} / 납기: {sup.lt} / MOQ: {sup.moq?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div
                    className="vendor-item selected"
                    onClick={() => setSelectedVendor(rfqModalItem.supplyer)}
                  >
                    <span className="radio-box">🔘</span>
                    <div className="v-info">
                      <span className="v-name">{rfqModalItem.supplyer}</span>
                      <span className="v-meta">납기: {rfqModalItem.lead_time} / MOQ: {rfqModalItem.moq}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setRfqModalItem(null)}
              >
                취소
              </button>
              <button
                type="button"
                className="btn-submit"
                onClick={handleRfqSubmit}
              >
                {selectedVendor || rfqModalItem.supplyer} 견적요청서 발송
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. 정식 발주서(PO) 발행 모달                                         */}
      {/* ==================================================================== */}
      {poModalItem && (
        <div className="procure-modal-overlay" onClick={() => setPoModalItem(null)}>
          <div className="procure-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <span className="title">🛒 정식 발주서(PO) 발행</span>
              <button
                type="button"
                className="close-btn"
                onClick={() => setPoModalItem(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-content">
              <div className="summary-box">
                <div className="row">
                  <span className="k">발주 품목:</span>
                  <span className="v">{poModalItem.itemName}</span>
                </div>
                <div className="row">
                  <span className="k">수신 공급처:</span>
                  <span className="v highlight">{poModalItem.selected_supplier || poModalItem.supplyer}</span>
                </div>
                <div className="row">
                  <span className="k">발주 확정 수량:</span>
                  <span className="v highlight">
                    {poModalItem.suggestedPo.toLocaleString()} EA (MOQ: {poModalItem.moq.toLocaleString()})
                  </span>
                </div>
                <div className="row">
                  <span className="k">공급처 리드타임:</span>
                  <span className="v">발주일로부터 {poModalItem.lead_time} 소요</span>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                상기 확정 조건으로 공급처에 정식 발주서(Purchase Order)를 발행하고 구매 시스템에 등록합니다.
              </p>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setPoModalItem(null)}
              >
                취소
              </button>
              <button
                type="button"
                className="btn-submit po"
                onClick={handlePoSubmit}
              >
                발주서 승인 및 전송
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardComponent;
