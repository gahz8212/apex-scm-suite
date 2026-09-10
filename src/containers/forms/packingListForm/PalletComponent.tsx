import React, { useRef, useEffect, useState, useMemo } from 'react';
import { select_modelname } from '../../../lib/utils/parseModelName';

type Props = {
    palletData: {
        [key: number]: { [key: string]: string | number | undefined; }[];
    };
    packingCartonMap?: { [key: string]: number };
    settingPallet: (Pnumber: number, itemData: { item: string; totalCT_qty?: number; CT_qty: number; quantity: number; weight: number; moq: number; cbm: number; sets: string; mode: string; }) => void;
    reorderPallet: (pNo: number, sourceIdx: number, targetIdx: number) => void;
    addCount: (id: number, item: string, value: number, itemIndex?: number, maxAllowed?: number) => void;
    removeCount: (id: number, item: string, value: number, itemIndex?: number) => void;
    onInputPallet: () => void;
    removeItem: (id: number, item: string, itemIndex?: number) => void;
    resetPallet: () => void;
    onClose?: () => void;
};

type RowProps = {
    item: {
        [key: string]: string | number | undefined;
        item: string;
        CT_qty: number;
        totalCT_qty?: number;
        sets?: string;
        weight?: number;
        cbm?: number;
        moq?: number;
        quantity?: number;
    };
    itemIdx: number;
    palletIndex: number;
    palletData: Props['palletData'];
    packingCartonMap?: { [key: string]: number };
    addCount: Props['addCount'];
    removeCount: Props['removeCount'];
    removeItem: Props['removeItem'];
    reorderPallet: Props['reorderPallet'];
    draggedItemRef: React.MutableRefObject<{ palletIndex: number; itemIdx: number; name?: string; } | null>;
};

const PalletRowItem: React.FC<RowProps> = ({
    item,
    itemIdx,
    palletIndex,
    palletData,
    packingCartonMap,
    addCount,
    removeCount,
    removeItem,
    reorderPallet,
    draggedItemRef,
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isDraggingSelf, setIsDraggingSelf] = useState(false);
    const interRef = useRef<NodeJS.Timeout | null>(null);
    const toutRef = useRef<NodeJS.Timeout | null>(null);
    const isLongPressRef = useRef<boolean>(false);

    function clearTimers() {
        if (toutRef.current) {
            clearTimeout(toutRef.current);
            toutRef.current = null;
        }
        if (interRef.current) {
            clearInterval(interRef.current);
            interRef.current = null;
        }
    }

    const itemName = String(item.item || '');
    const currentQty = Number(item.CT_qty || 0);

    // 1. Determine total cartons for this item in Packing
    const packingCarton = packingCartonMap && typeof packingCartonMap[itemName] === 'number' && packingCartonMap[itemName] > 0
        ? packingCartonMap[itemName]
        : undefined;

    const maxCartons = Number(
        packingCarton !== undefined
            ? packingCarton
            : (item.totalCT_qty || currentQty || 1)
    );

    // 2. Cartons already packed in other pallets/rows for this same item
    let otherRowsPacked = 0;
    if (palletData) {
        Object.keys(palletData).forEach((key) => {
            const pNo = Number(key);
            const pItems = palletData[pNo];
            if (Array.isArray(pItems)) {
                pItems.forEach((pItem, rIdx) => {
                    if (pItem && pItem.item === itemName) {
                        if (!(pNo === palletIndex && rIdx === itemIdx)) {
                            otherRowsPacked += Number(pItem.CT_qty || 0);
                        }
                    }
                });
            }
        });
    }

    // 3. Max allowed CT_qty for this row
    const maxAllowed = Math.max(1, maxCartons - otherRowsPacked);
    const isMax = currentQty >= maxAllowed;

    useEffect(() => {
        if (isMax) {
            clearTimers();
        }
    }, [isMax]);

    useEffect(() => {
        return () => {
            clearTimers();
        };
    }, []);

    function inCrease(id: number, it: string, val: number, idx: number, max: number) {
        clearTimers();
        isLongPressRef.current = false;
        toutRef.current = setTimeout(() => {
            isLongPressRef.current = true;
            interRef.current = setInterval(() => {
                addCount(id, it, val, idx, max);
            }, 100);
        }, 500);
    }

    function deCrease(id: number, it: string, val: number, idx: number) {
        clearTimers();
        isLongPressRef.current = false;
        toutRef.current = setTimeout(() => {
            isLongPressRef.current = true;
            interRef.current = setInterval(() => {
                removeCount(id, it, val, idx);
            }, 100);
        }, 500);
    }

    return (
        <div
            className='elem-pallet'
            draggable
            style={{
                backgroundColor: isDragOver ? '#e3f2fd' : undefined,
                borderTop: isDragOver ? '2px solid #1976d2' : '2px solid transparent',
                borderBottom: '2px solid transparent',
                opacity: isDraggingSelf ? 0.4 : 1,
                transition: 'background-color 0.15s ease, border-color 0.15s ease',
                cursor: 'grab',
            }}
            onDragStart={(e) => {
                draggedItemRef.current = {
                    palletIndex,
                    itemIdx,
                    name: item.item,
                };
                setIsDraggingSelf(true);
                e.dataTransfer.setData('palletIndex', String(palletIndex));
                e.dataTransfer.setData('itemIdx', String(itemIdx));
                const img = new Image();
                img.src = './images/package.png';
                e.dataTransfer.setDragImage(img, 50, 50);
                e.dataTransfer.setData('item', JSON.stringify({
                    name: item.item,
                    totalCT_qty: maxCartons,
                    CT_qty: item.CT_qty,
                    quantity: item.quantity,
                    weight: item.weight,
                    moq: item.moq,
                    cbm: item.cbm,
                    sets: item.sets,
                    mode: 'copy'
                }));
                clearTimers();
            }}
            onDragEnd={() => {
                setIsDraggingSelf(false);
                setIsDragOver(false);
                draggedItemRef.current = null;
            }}
            onDragOver={(e) => {
                if (draggedItemRef.current && draggedItemRef.current.palletIndex === palletIndex) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (draggedItemRef.current.itemIdx !== itemIdx) {
                        setIsDragOver(true);
                    }
                }
            }}
            onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setIsDragOver(false);
                }
            }}
            onDrop={(e) => {
                if (draggedItemRef.current && draggedItemRef.current.palletIndex === palletIndex) {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragOver(false);
                    const sourceIdx = draggedItemRef.current.itemIdx;
                    const targetIdx = itemIdx;
                    if (sourceIdx !== targetIdx) {
                        reorderPallet(palletIndex, sourceIdx, targetIdx);
                    }
                    draggedItemRef.current = null;
                }
            }}
        >
            <span className='modelName'>
                {typeof item.item === 'string' &&
                    select_modelname(item.item)
                }
            </span>
            {item.CT_qty ? <div
                className='material-symbols'
                draggable={false}
                onDragStart={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
            >
                <span
                    className="material-symbols-outlined add"
                    style={{
                        cursor: isMax ? 'not-allowed' : 'pointer',
                        opacity: isMax ? 0.35 : 1,
                    }}
                    title={isMax ? `최대 카톤 수량(${maxAllowed} C/T)에 도달했습니다.` : undefined}
                    onClick={() => {
                        if (isLongPressRef.current) {
                            isLongPressRef.current = false;
                            return;
                        }
                        if (isMax) return;
                        if (typeof item.item === 'string' && typeof item.CT_qty === 'number') {
                            addCount(palletIndex, item.item, item.CT_qty, itemIdx, maxAllowed);
                        }
                    }}
                    onMouseDown={() => {
                        if (isMax) return;
                        if (typeof item.item === 'string' && typeof item.CT_qty === 'number') {
                            inCrease(palletIndex, item.item, item.CT_qty, itemIdx, maxAllowed);
                        }
                    }}
                    onMouseUp={clearTimers}
                    onMouseLeave={clearTimers}
                >
                    add_circle
                </span>
                <span className='CT_qty'>{item.CT_qty}</span>
                <span
                    className="material-symbols-outlined remove "
                    onClick={() => {
                        if (isLongPressRef.current) {
                            isLongPressRef.current = false;
                            return;
                        }
                        if (item.CT_qty === 1) {
                            // eslint-disable-next-line no-restricted-globals
                            let result = confirm('이 품목을 삭제합니까?');
                            if (result) {
                                if (typeof item.item === 'string') {
                                    removeItem(palletIndex, item.item, itemIdx);
                                }
                            }
                            return;
                        }
                        if (typeof item.item === 'string' && typeof item.CT_qty === 'number') {
                            removeCount(palletIndex, item.item, item.CT_qty, itemIdx);
                        }
                    }}
                    onMouseDown={() => {
                        if (typeof item.item === 'string' && typeof item.CT_qty === 'number') {
                            deCrease(palletIndex, item.item, item.CT_qty, itemIdx);
                        }
                    }}
                    onMouseUp={clearTimers}
                    onMouseLeave={clearTimers}
                >
                    do_not_disturb_on
                </span>
            </div> : <div
                draggable={false}
                onDragStart={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
            >
                <span className="material-symbols-outlined remove repair"
                    onClick={() => {
                        // eslint-disable-next-line no-restricted-globals
                        let result = confirm('이 품목을 삭제합니까?');
                        if (result) {
                            if (typeof item.item === 'string') {
                                removeItem(palletIndex, item.item, itemIdx);
                            }
                        }
                    }}
                >
                    delete
                </span>
            </div>}
        </div>
    );
};

type Items = {
    items: any[];
    index: number;
    palletData: Props['palletData'];
    packingCartonMap?: { [key: string]: number };
    addCount: Props['addCount'];
    removeCount: Props['removeCount'];
    removeItem: Props['removeItem'];
    resetPallet: () => void;
    reorderPallet: Props['reorderPallet'];
    draggedItemRef: React.MutableRefObject<{ palletIndex: number; itemIdx: number; name?: string; } | null>;
};

const PalletItems: React.FC<Items> = ({
    items,
    addCount,
    removeCount,
    index,
    removeItem,
    resetPallet,
    palletData,
    packingCartonMap,
    reorderPallet,
    draggedItemRef
}) => {
    return <div className="pallet-items-scroll">
        {Array.isArray(items) && items.map((item, itemIdx) => item && item.item && (
            <PalletRowItem
                key={`${item.item}-${itemIdx}`}
                item={item}
                itemIdx={itemIdx}
                palletIndex={index}
                palletData={palletData}
                packingCartonMap={packingCartonMap}
                addCount={addCount}
                removeCount={removeCount}
                removeItem={removeItem}
                reorderPallet={reorderPallet}
                draggedItemRef={draggedItemRef}
            />
        ))}
    </div>;
};

const PalletComponent: React.FC<Props> = ({
    palletData,
    packingCartonMap,
    settingPallet,
    reorderPallet,
    addCount,
    removeCount,
    onInputPallet,
    removeItem,
    resetPallet,
    onClose
}) => {
    const draggedItemRef = useRef<{ palletIndex: number; itemIdx: number; name?: string; } | null>(null);

    // 최소 3개(1~3번) 표시, 기존에 적재된 팔레트가 더 많다면 그 수만큼 표시
    const maxIndexWithData = useMemo(() => {
        let maxIdx = 2; // 최소 3개 (0, 1, 2)
        if (palletData && typeof palletData === 'object') {
            Object.keys(palletData).forEach(key => {
                const idx = Number(key);
                if (Array.isArray(palletData[idx]) && palletData[idx].length > 0) {
                    if (idx > maxIdx) maxIdx = idx;
                }
            });
        }
        return maxIdx + 1; // 1부터 시작하는 개수
    }, [palletData]);

    const [visibleCount, setVisibleCount] = useState<number>(() => Math.max(3, maxIndexWithData));

    useEffect(() => {
        if (maxIndexWithData > visibleCount) {
            setVisibleCount(maxIndexWithData);
        }
    }, [maxIndexWithData, visibleCount]);

    const handleAddPallet = () => {
        setVisibleCount(prev => prev + 1);
    };

    const activeIndices = useMemo(() => {
        return Array.from({ length: visibleCount }, (_, i) => i);
    }, [visibleCount]);

    const drop = (index: number, itemName: { name: string; totalCT_qty?: number; CT_qty: number; quantity: number; weight: number; moq: number; cbm: number; sets: string; mode: string; }) => {
        settingPallet(index, {
            item: itemName.name,
            totalCT_qty: itemName.totalCT_qty ?? itemName.CT_qty,
            CT_qty: itemName.CT_qty, quantity: itemName.quantity, weight: itemName.weight,
            moq: itemName.moq, cbm: itemName.cbm, sets: itemName.sets, mode: itemName.mode
        });
    };

    if (!palletData || typeof palletData !== 'object' || Array.isArray(palletData)) { return null; }

    return (
        <div className='wrap-pallets'>
            <div className="title">
                <span className="title-text">PALLET PACKING (적재 계획)</span>
                {onClose && (
                    <button type="button" className="close-btn" onClick={onClose} title="닫기">
                        &times;
                    </button>
                )}
            </div>
            <div className='wrap-pallet'>
                {activeIndices.map((index) => {
                    const data = palletData[index] || [];
                    const totalCartons = (Array.isArray(data) ? data : []).reduce(
                        (acc, it) => acc + (Number(it?.CT_qty) || 0),
                        0
                    );
                    const isEmpty = !Array.isArray(data) || data.length === 0;

                    return (
                        <div
                            className='outline-pallet'
                            key={index}
                            onDragLeave={(e) => {
                                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                    e.currentTarget.classList.remove('drag-over');
                                }
                            }}
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.add('drag-over');
                            }}
                            onDrop={(e) => {
                                e.currentTarget.classList.remove('drag-over');
                                const sourcePalletStr = e.dataTransfer.getData('palletIndex');
                                const sourceItemStr = e.dataTransfer.getData('itemIdx');

                                // Check if drop originated from within this exact pallet
                                const isSamePallet =
                                    (draggedItemRef.current && draggedItemRef.current.palletIndex === index) ||
                                    (sourcePalletStr !== '' && Number(sourcePalletStr) === index);

                                if (isSamePallet) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const currentList = palletData[index] || [];
                                    const sourceIdx =
                                        draggedItemRef.current && draggedItemRef.current.itemIdx !== undefined
                                            ? draggedItemRef.current.itemIdx
                                            : Number(sourceItemStr);

                                    if (typeof sourceIdx === 'number' && sourceIdx >= 0 && sourceIdx < currentList.length) {
                                        const targetIdx = currentList.length - 1;
                                        if (sourceIdx !== targetIdx) {
                                            reorderPallet(index, sourceIdx, targetIdx);
                                        }
                                    }
                                    draggedItemRef.current = null;
                                    return;
                                }

                                const rawData = e.dataTransfer.getData('item');
                                if (!rawData) return;
                                const parsed = JSON.parse(rawData);
                                const { name, CT_qty, quantity, weight, moq, cbm, sets, mode, totalCT_qty, category, isSubMaterial } = parsed;

                                if (mode === 'move') {
                                    let alreadyPacked = 0;
                                    let alreadyDropped = false;
                                    if (palletData) {
                                        Object.keys(palletData).forEach((key) => {
                                            const pItems = palletData[Number(key)];
                                            if (Array.isArray(pItems)) {
                                                pItems.forEach((pItem) => {
                                                    if (pItem && pItem.item === name) {
                                                        alreadyDropped = true;
                                                        alreadyPacked += Number(pItem.CT_qty || 0);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                    const originalTotal = Number(
                                        (packingCartonMap && typeof packingCartonMap[name] === 'number' && packingCartonMap[name] > 0)
                                            ? packingCartonMap[name]
                                            : (totalCT_qty || CT_qty || 0)
                                    );
                                    const isSub = Boolean(isSubMaterial || category === 'REPAIR' || sets === 'EA' || originalTotal === 0);

                                    if (isSub) {
                                        if (alreadyDropped) {
                                            alert(`이미 해당 부자재(${name})가 팔레트에 적재되었습니다.`);
                                            return;
                                        }
                                        const dropCT = originalTotal > 0 ? originalTotal : (Number(CT_qty) || 0);
                                        const newQuantity = moq && dropCT > 0 ? dropCT * moq : Number(quantity || 0);
                                        drop(index, { name, totalCT_qty: dropCT, CT_qty: dropCT, quantity: newQuantity, weight: Number(weight) || 0, moq: Number(moq) || 0, cbm: Number(cbm) || 0, sets: sets || 'EA', mode });
                                    } else {
                                        const remaining = originalTotal - alreadyPacked;
                                        if (remaining <= 0) {
                                            alert(`이미 해당 품목(${name})의 모든 카톤(${originalTotal} C/T)이 팔레트에 적재되었습니다.`);
                                            return;
                                        }
                                        const isAlreadyInThisPallet = (palletData[index] || []).some(pItem => pItem && pItem.item === name);
                                        if (isAlreadyInThisPallet) {
                                            alert(`이미 해당 팔레트에 동일한 품목(${name})이 존재합니다.`);
                                            return;
                                        }
                                        const newQuantity = moq ? remaining * moq : remaining;
                                        drop(index, { name, totalCT_qty: originalTotal, CT_qty: remaining, quantity: newQuantity, weight: Number(weight) || 0, moq: Number(moq) || 0, cbm: Number(cbm) || 0, sets: sets || 'SET', mode });
                                    }
                                } else if (mode === 'copy') {
                                    const isAlreadyInThisPallet = (palletData[index] || []).some(pItem => pItem && pItem.item === name);
                                    if (isAlreadyInThisPallet) {
                                        alert(`이미 해당 팔레트에 동일한 품목(${name})이 존재합니다.`);
                                        return;
                                    }
                                    const originalTotal = Number(
                                        (packingCartonMap && typeof packingCartonMap[name] === 'number' && packingCartonMap[name] > 0)
                                            ? packingCartonMap[name]
                                            : (totalCT_qty || CT_qty || 0)
                                    );
                                    drop(index, { name, totalCT_qty: originalTotal, CT_qty, quantity, weight, moq, cbm, sets, mode });
                                } else {
                                    const { summary, mode: repairMode } = parsed;
                                    summary.sort((a: { id: number }, b: { id: number }) => b.id - a.id).forEach((data: {
                                        itemName: string;
                                        CT_qty: number;
                                        totalCT_qty?: number;
                                        quantity: number;
                                        weight: number;
                                        moq: number;
                                        cbm: number;
                                        sets: string;
                                        mode: string;
                                    }) => {
                                        const isAlreadyInThisPallet = (palletData[index] || []).some(pItem => pItem && pItem.item === data.itemName);
                                        if (isAlreadyInThisPallet) {
                                            return;
                                        }
                                        const orig = Number(
                                            (packingCartonMap && typeof packingCartonMap[data.itemName] === 'number' && packingCartonMap[data.itemName] > 0)
                                                ? packingCartonMap[data.itemName]
                                                : (data.totalCT_qty || data.CT_qty || 0)
                                        );
                                        drop(index, {
                                            name: data.itemName,
                                            totalCT_qty: orig,
                                            CT_qty: data.CT_qty,
                                            quantity: data.quantity,
                                            weight: data.weight,
                                            moq: data.moq,
                                            cbm: data.cbm,
                                            sets: data.sets,
                                            mode: data.mode || repairMode
                                        });
                                    });
                                }
                            }}
                        >
                            <div className="pallet-card-header">
                                <span className="pallet-badge">PALLET #{index + 1}</span>
                                {totalCartons > 0 && (
                                    <span className="pallet-ct-badge">{totalCartons} C/T</span>
                                )}
                            </div>

                            {isEmpty ? (
                                <div className="pallet-empty-placeholder">
                                    <span className="material-symbols-outlined icon">move_to_inbox</span>
                                    <span>카톤을 드래그하여 적재</span>
                                </div>
                            ) : (
                                <PalletItems
                                    items={Array.isArray(data) ? data : []}
                                    addCount={addCount}
                                    removeCount={removeCount}
                                    index={index}
                                    removeItem={removeItem}
                                    resetPallet={resetPallet}
                                    palletData={palletData}
                                    packingCartonMap={packingCartonMap}
                                    reorderPallet={reorderPallet}
                                    draggedItemRef={draggedItemRef}
                                />
                            )}
                        </div>
                    );
                })}

                {/* [+] 신규 팔레트 추가 카드 ([1][2], [3][+]) */}
                <div
                    className='outline-pallet add-pallet-card'
                    onClick={handleAddPallet}
                    title={`팔레트 #${visibleCount + 1} 추가 (클릭 시 생성)`}
                >
                    <div className="add-card-content">
                        <span className="material-symbols-outlined plus-icon">add_circle</span>
                        <span className="plus-label">팔레트 #{visibleCount + 1} 추가</span>
                    </div>
                </div>
            </div>

            <div className="pallet-footer-actions">
                <button type="button" className="btn-reset" onClick={resetPallet} title="모든 팔레트 적재 내역 초기화">
                    <span className="material-symbols-outlined">refresh</span>
                    <span>초기화</span>
                </button>
                <button type="button" className="btn-save" onClick={onInputPallet} title="팔레트 정보 저장">
                    <span className="material-symbols-outlined">save</span>
                    <span>적재 확정 (저장)</span>
                </button>
            </div>
        </div>
    );
};

export default PalletComponent;