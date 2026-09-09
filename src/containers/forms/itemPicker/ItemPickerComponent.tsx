import React from 'react';
import { formatCurrencySymbol } from '../../../lib/utils/formatCurrency';

type Props = {
    addPicked: (picked: {}) => void;
    removePicked: (id: number) => void;
    inputPicked: () => void;
    pickedData: {
        id: number;
        ItemId: number;
        itemName: string;
        unit: string;
        im_price: number;
        ex_price: number;
        quantity: number;
        CT_qty: number;
        weight: number;
        cbm: number;
    }[] | null;
    initPicked: () => void;
    onChange: (e: any) => void;
    onClose?: () => void;
};

const ItemPickerComponent: React.FC<Props> = ({
    addPicked, removePicked, pickedData, inputPicked, initPicked, onChange, onClose
}) => {
    return (
        <div className="wrap-picker">
            {/* 1. Sleek Header */}
            <div className="picker-header">
                <div className="header-left">
                    <span className="material-symbols-outlined header-icon">inventory_2</span>
                    <span className="picker-title">아이템 수집</span>
                    <span className="picker-badge">
                        {pickedData && pickedData.length > 0 ? `총 ${pickedData.length}건` : '0건'}
                    </span>
                </div>
                <button type="button" className="picker-close-btn" onClick={onClose} title="닫기">
                    ✕
                </button>
            </div>

            {/* 2. Drag & Drop Notice Guide */}
            <div className="picker-notice">
                <span className="material-symbols-outlined notice-icon">drag_indicator</span>
                <span>부자재(ASSY, PARTS) 카드를 아래 영역으로 드래그하여 수집 목록에 추가하세요.</span>
            </div>

            {/* 3. Table Header */}
            <div className="table-header">
                <div className="col-name">품명</div>
                <div className="col-cost">입고단가</div>
                <div className="col-price">수출단가</div>
                <div className="col-qty">수출수량</div>
                <div className="col-action"></div>
            </div>

            {/* 4. Drop Zone & Items */}
            <div
                className="itemList"
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={(e) => {
                    e.preventDefault();
                    const dataStr = e.dataTransfer.getData('pickedItem');
                    if (!dataStr) return;
                    try {
                        const pickedItem = JSON.parse(dataStr);
                        if (pickedItem) {
                            if (pickedItem.type === 'SET') {
                                alert('제품(SET)은 부자재 수집 대상이 아닙니다. 부자재(ASSY, PARTS 등)만 선택해 주세요.');
                                return;
                            }
                            addPicked(pickedItem);
                        }
                    } catch (err) {
                        console.error('Failed to parse pickedItem', err);
                    }
                }}
            >
                {pickedData && pickedData.length > 0 ? (
                    pickedData.map((picked) => (
                        <div key={picked.itemName} className="pickedList">
                            <div className="col-name" title={picked.itemName}>
                                <span className="item-name-text">{picked.itemName}</span>
                            </div>
                            <div className="col-cost">
                                <span className="cost-unit">{formatCurrencySymbol(picked.unit)}</span>
                                <span className="cost-val">
                                    {picked.im_price ? picked.im_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0'}
                                </span>
                            </div>
                            <div className="col-price">
                                <span className="price-unit">$</span>
                                <span className="price-val">
                                    {picked.ex_price ? picked.ex_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0'}
                                </span>
                            </div>
                            <div className="col-qty">
                                <input
                                    type="text"
                                    name="quantity"
                                    min={0}
                                    value={picked.quantity}
                                    id={picked.ItemId.toString()}
                                    placeholder="0"
                                    onChange={onChange}
                                    className="qty-input"
                                    onFocus={e => e.target.select()}
                                />
                            </div>
                            <div className="col-action">
                                <button
                                    type="button"
                                    className="trash-btn"
                                    onClick={() => removePicked(picked.ItemId)}
                                    title="목록에서 삭제"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-drop-box">
                        <span className="material-symbols-outlined empty-icon">add_shopping_cart</span>
                        <p className="empty-title">수집된 부자재가 없습니다</p>
                        <p className="empty-desc">부자재 카드를 이곳으로 드래그 앤 드롭하세요</p>
                    </div>
                )}
            </div>

            {/* 5. Footer Summary & Action Controls */}
            <div className="picker-footer">
                <div className="footer-summary">
                    <span>수집 품목: <strong>{pickedData?.length || 0}</strong>건</span>
                </div>
                <div className="footer-buttons">
                    <button type="button" className="btn-reset" onClick={initPicked}>
                        초기화
                    </button>
                    <button type="button" className="btn-submit" onClick={inputPicked}>
                        입력 완료
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ItemPickerComponent;