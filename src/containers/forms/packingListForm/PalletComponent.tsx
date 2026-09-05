import React, { useRef, useEffect } from 'react';
import { select_modelname } from '../../../lib/utils/parseModelName';

type Props = {
    palletData: {
        [key: number]: { [key: string]: string | number | undefined; }[];
    };
    packingCartonMap?: { [key: string]: number };
    settingPallet: (Pnumber: number, itemData: { item: string; totalCT_qty?: number; CT_qty: number; quantity: number; weight: number; moq: number; cbm: number; sets: string; mode: string; }) => void;
    addCount: (id: number, item: string, value: number, itemIndex?: number, maxAllowed?: number) => void;
    removeCount: (id: number, item: string, value: number, itemIndex?: number) => void;
    onInputPallet: () => void;
    removeItem: (id: number, item: string, itemIndex?: number) => void;
    resetPallet: () => void;
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
}) => {
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
            onDragStart={(e) => {
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
        >
            <span className='modelName'>
                {typeof item.item === 'string' &&
                    select_modelname(item.item)
                }
            </span>
            {item.CT_qty ? <div className='material-symbols' >
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
            </div> : <div><span className="material-symbols-outlined remove repair"
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
            </span></div>}
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
};

const PalletItems: React.FC<Items> = ({ items, addCount, removeCount, index, removeItem, resetPallet, palletData, packingCartonMap }) => {
    return <div>
        {items.map((item, itemIdx) => item.item && (
            <PalletRowItem
                key={itemIdx}
                item={item}
                itemIdx={itemIdx}
                palletIndex={index}
                palletData={palletData}
                packingCartonMap={packingCartonMap}
                addCount={addCount}
                removeCount={removeCount}
                removeItem={removeItem}
            />
        ))}
    </div>;
};

const PalletComponent: React.FC<Props> = ({ palletData, packingCartonMap, settingPallet, addCount, removeCount, onInputPallet, removeItem, resetPallet }) => {

    const drop = (index: number, itemName: { name: string; totalCT_qty?: number; CT_qty: number; quantity: number; weight: number; moq: number; cbm: number; sets: string; mode: string; }) => {
        settingPallet(index, {
            item: itemName.name,
            totalCT_qty: itemName.totalCT_qty ?? itemName.CT_qty,
            CT_qty: itemName.CT_qty, quantity: itemName.quantity, weight: itemName.weight,
            moq: itemName.moq, cbm: itemName.cbm, sets: itemName.sets, mode: itemName.mode
        });
    };

    const values = Object.values(palletData);
    if (!palletData) { return null; }

    return (
        <div className='wrap-pallets'>
            <div className="title">PALLET</div>
            <div className='wrap-pallet'>
                {values.map((data, index) => <div
                    className='outline-pallet'
                    key={index}
                    onDragLeave={(e) => { e.currentTarget.style.background = "white"; }}
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.background = "pink";
                    }}
                    onDrop={(e) => {
                        const parsed = JSON.parse(e.dataTransfer.getData('item'));
                        const { name, CT_qty, quantity, weight, moq, cbm, sets, mode, totalCT_qty } = parsed;

                        if (mode === 'move') {
                            let alreadyPacked = 0;
                            if (palletData) {
                                Object.keys(palletData).forEach((key) => {
                                    const pItems = palletData[Number(key)];
                                    if (Array.isArray(pItems)) {
                                        pItems.forEach((pItem) => {
                                            if (pItem && pItem.item === name) {
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
                            const remaining = originalTotal - alreadyPacked;
                            if (remaining <= 0) {
                                alert(`이미 해당 품목(${name})의 모든 카톤(${originalTotal} C/T)이 팔레트에 적재되었습니다.`);
                                e.currentTarget.style.background = "white";
                                return;
                            }
                            const newQuantity = moq ? remaining * moq : remaining;
                            drop(index, { name, totalCT_qty: originalTotal, CT_qty: remaining, quantity: newQuantity, weight, moq, cbm, sets, mode });
                        } else if (mode === 'copy') {
                            const originalTotal = Number(
                                (packingCartonMap && typeof packingCartonMap[name] === 'number' && packingCartonMap[name] > 0)
                                    ? packingCartonMap[name]
                                    : (totalCT_qty || CT_qty || 0)
                            );
                            drop(index, { name, totalCT_qty: originalTotal, CT_qty, quantity, weight, moq, cbm, sets, mode });
                        } else {
                            const { summary, mode: repairMode } = parsed;
                            summary.sort((a: { id: number }, b: { id: number }) => b.id - a.id).map((data: {
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
                                const orig = Number(
                                    (packingCartonMap && typeof packingCartonMap[data.itemName] === 'number' && packingCartonMap[data.itemName] > 0)
                                        ? packingCartonMap[data.itemName]
                                        : (data.totalCT_qty || data.CT_qty || 0)
                                );
                                return drop(index, {
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
                        e.currentTarget.style.background = "white";
                    }}
                >
                    <div style={{ position: 'absolute', left: index < 9 ? "40%" : "30%", fontSize: '80px', opacity: '.1', userSelect: 'none', pointerEvents: 'none' }}>
                        {index + 1}
                    </div>
                    <PalletItems
                        items={data}
                        addCount={addCount}
                        removeCount={removeCount}
                        index={index}
                        removeItem={removeItem}
                        resetPallet={resetPallet}
                        palletData={palletData}
                        packingCartonMap={packingCartonMap}
                    />
                </div>)}
            </div>
            <button onClick={resetPallet}>초기화</button>
            <button onClick={onInputPallet}>입력</button>
        </div>
    );
};

export default PalletComponent;