import React, { useState, useRef, useMemo, useEffect } from 'react';
import InvoiceContainer from '../forms/invoiceForm/InvoiceContainer';
import PackingContainer from '../forms/packingListForm/PackingContainer';
import PalletContainer from '../forms/packingListForm/PalletContainer';
import { useDrag } from 'react-use-gesture';
import { useDispatch } from 'react-redux'
import { itemActions } from '../../store/slices/itemSlice';
import { calculatePackingData } from '../../lib/utils/calculatePackingData';
type Props = {
    model: string
    setModel: React.Dispatch<React.SetStateAction<string>>
    onChangeParts: (e: any) => void;
    onChangeOrder: (e: any) => void;
    onChangeItem: (e: any) => void;
    onChangePicked: (e: any) => void;

    orderInput: React.LegacyRef<HTMLInputElement> | undefined;
    partsInput: React.LegacyRef<HTMLInputElement> | undefined;
    itemsInput: React.LegacyRef<HTMLInputElement> | undefined;
    orderData: any[] | null;
    months: string[] | null;

    openInvoiceForm: () => void;
    openPackingForm: () => void;
    openAddItemForm: () => void;
    invoiceForm: { visible: boolean; position: { x: number; y: number } };
    packingForm: { visible: boolean; position: { x: number; y: number } };
    addItemForm: { visible: boolean; position: { x: number; y: number } };
    palletForm: { visible: boolean; position: { x: number; y: number } };
    changePosition: (form: string, position: { x: number, y: number }) => void;
    pickedData: {
        id: number;
        ItemId: number;
        check: boolean;
        itemName: string;
        im_price: number;
        ex_price: number;
        quantity: number;
        CT_qty: number;
        weight: number;
        cbm: number;
    }[] | null
    removePicked: (id: number) => void;
    partPackaging: { [key: number]: {} } | undefined
    setSelect: (select: boolean) => void;
    inputRepairToOrdersheet: (repair: {
        id: number;
        ItemId: number;
        check: boolean;
        itemName: string;
        month: string;
        quantity: number;
        description: string;
        category: string;
        unit: string;
        im_price: number
        ex_price: number;
        sets: string;
        weight: number;
        cbm: number;
        CT_qty: number;
        number1: number;
        use: boolean;

    }[]) => void;
}
const ExportComponent: React.FC<Props> = ({
    model,
    setModel,
    onChangeParts,
    onChangeOrder,
    onChangeItem,
    orderInput,
    partsInput,
    itemsInput,
    orderData,
    months,
    invoiceForm,
    packingForm,
    addItemForm,
    palletForm,
    openInvoiceForm,
    openPackingForm,
    openAddItemForm,
    changePosition,
    pickedData,
    removePicked,
    onChangePicked,
    partPackaging,
    setSelect,
    inputRepairToOrdersheet
}) => {
    const dragItem: any = useRef();
    const dragOverItem: any = useRef();
    const dispatch = useDispatch();
    const [formZIndex, setFormZIndex] = useState<{ [key: string]: number }>({
        invoice: 30,
        packing: 32,
        pallet: 34,
    });
    const bringToFront = (form: string) => {
        setFormZIndex(prev => {
            const currentZ = prev[form] || 30;
            const maxZ = Math.max(...Object.values(prev));
            if (currentZ === maxZ) return prev;
            return {
                ...prev,
                [form]: maxZ + 2,
            };
        });
    };
    const invoicePos = useDrag(params => {
        bringToFront('invoice');
        const nextX = Math.max(10, Math.min(window.innerWidth - 550, params.offset[0] + 60));
        const nextY = Math.max(70, Math.min(window.innerHeight - 200, params.offset[1] + 120));
        changePosition('invoice', { x: nextX, y: nextY });
    });
    const packingPos = useDrag(params => {
        bringToFront('packing');
        const nextX = Math.max(10, Math.min(window.innerWidth - 550, params.offset[0] + 500));
        const nextY = Math.max(70, Math.min(window.innerHeight - 200, params.offset[1] + 120));
        changePosition('packing', { x: nextX, y: nextY });
    });
    const palletPos = useDrag(params => {
        bringToFront('pallet');
        const nextX = Math.max(10, Math.min(window.innerWidth - 680, params.offset[0] + 720));
        const nextY = Math.max(70, Math.min(window.innerHeight - 200, params.offset[1] + 120));
        changePosition('pallet', { x: nextX, y: nextY });
    });
    let orderdata;
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const activeMonth = selectedMonth || (months && months.length > 0 ? months[0] : '');

    const productPackingData = useMemo(() => {
        if (!orderData || !activeMonth) return [];
        const packingItems = calculatePackingData(orderData, activeMonth);
        const map = new Map<string, { itemName: string; quantity: number; CT_qty: number; weight: number; cbm: number; moq: number; sets: string }>();
        packingItems.forEach(p => {
            const existing = map.get(p.itemName);
            if (existing) {
                existing.quantity += p.quantity;
                existing.CT_qty += p.CT_qty;
            } else {
                map.set(p.itemName, {
                    itemName: p.itemName,
                    quantity: p.quantity,
                    CT_qty: p.CT_qty,
                    weight: p.weight,
                    cbm: p.cbm,
                    moq: p.moq,
                    sets: p.sets,
                });
            }
        });
        return Array.from(map.values());
    }, [orderData, activeMonth]);

    const [checkedProducts, setCheckedProducts] = useState<{ [itemName: string]: boolean }>({});
    const [productOverrides, setProductOverrides] = useState<{
        [itemName: string]: { quantity?: number; cbm?: number }
    }>({});

    useEffect(() => {
        setCheckedProducts({});
        setProductOverrides({});
    }, [activeMonth]);

    const handleProductOverride = (itemName: string, field: 'quantity' | 'cbm', value: string) => {
        const num = value === '' ? undefined : Number(value);
        setProductOverrides(prev => ({
            ...prev,
            [itemName]: {
                ...prev[itemName],
                [field]: num
            }
        }));
    };

    const isProductChecked = (itemName: string): boolean => {
        return checkedProducts[itemName] !== undefined ? checkedProducts[itemName] : true;
    };

    const toggleProductCheck = (itemName: string) => {
        setCheckedProducts(prev => ({
            ...prev,
            [itemName]: !isProductChecked(itemName)
        }));
    };

    const handleSelectAll = (select: boolean) => {
        setSelect(select);
        const newChecked: { [key: string]: boolean } = {};
        productPackingData.forEach(prod => {
            newChecked[prod.itemName] = select;
        });
        setCheckedProducts(newChecked);
    };


    // const onDragStart = (index: number, column: number) => {
    //     dragItem.current = index;
    //     dragItemKey = months ? months[column] : '';
    // }
    // const onDragEnter = (index: number, column: number) => {
    //     dragOverItem.current = index;
    //     dragOverItemKey = months ? months[column] : '';
    // }
    // const onDrop = () => {
    //     const copyList: { [key: string]: number | string | null }[] = JSON.parse(JSON.stringify(orderData))
    //     copyList[dragOverItem.current][dragOverItemKey] = copyList[dragItem.current][dragItemKey];
    //     copyList[dragItem.current][dragItemKey] = null
    //     dragItem.current = null;
    //     dragOverItem.current = null;
    //     dispatch(OrderAction.getData(copyList))
    // }

    orderdata = orderData?.map((data, tr) =>
        <div className='tr'>
            <div className='td'>{data.itemName}</div>
            {months?.map((month, td) =>
                <div className='td'
                // draggable
                // onDragStart={() => { onDragStart(tr, td) }}
                // onDragEnter={() => { onDragEnter(tr, td) }}
                // onDragEnd={onDrop}

                >{data[month] > 0 && data[month].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    {/* <input type="number" name={`${month}`} value={data[month]} onChange={(e) => { onChange(e, tr) }} /> */}
                </div>)}
        </div>
    )
    // }
    return (
        <div className='export-wrapper'>
            {invoiceForm.visible && <div onMouseDown={() => bringToFront('invoice')}>
                <div {...invoicePos()} style={{
                    color: 'black',
                    position: 'fixed',
                    top: invoiceForm.position.y,
                    left: invoiceForm.position.x,
                    zIndex: formZIndex.invoice + 1,
                    textAlign: 'center',
                    width: '520px',
                    boxSizing: 'border-box'
                }}>
                    <div style={{ width: '520px', padding: '1rem', userSelect: 'none' }}></div>
                </div>
                <div style={{ position: 'fixed', top: invoiceForm.position.y, left: invoiceForm.position.x, zIndex: formZIndex.invoice }}>
                    <InvoiceContainer selectedMonth={selectedMonth || (months && months.length > 0 ? months[0] : '')} />
                </div>
            </div>}
            {packingForm.visible && <div onMouseDown={() => bringToFront('packing')}>
                <div {...packingPos()} style={{
                    color: 'black',
                    width: '520px',
                    position: 'fixed',
                    top: packingForm.position.y,
                    left: packingForm.position.x,
                    zIndex: formZIndex.packing + 1,
                    textAlign: 'center',
                    boxSizing: 'border-box'
                }}>
                    <div style={{ width: '520px', padding: '1rem', userSelect: 'none' }}></div>
                </div>
                <div style={{ position: 'fixed', top: packingForm.position.y, left: packingForm.position.x, zIndex: formZIndex.packing }}>
                    <PackingContainer
                        selectedMonth={selectedMonth || (months && months.length > 0 ? months[0] : '')}
                    />
                </div>
            </div>}
            {palletForm.visible && <div onMouseDown={() => bringToFront('pallet')}>
                <div {...palletPos()} style={{
                    color: 'black',
                    width: '650px',
                    position: 'fixed',
                    top: palletForm.position.y,
                    left: palletForm.position.x,
                    zIndex: formZIndex.pallet + 1,
                    textAlign: 'center',
                    boxSizing: 'border-box'

                }}>
                    <div style={{
                        width: '650px',
                        padding: '1rem',
                        userSelect: 'none',

                    }}></div>
                </div>
                <div style={{ position: 'fixed', top: palletForm.position.y, left: palletForm.position.x, zIndex: formZIndex.pallet }}>
                    <PalletContainer
                        selectedMonth={selectedMonth || (months && months.length > 0 ? months[0] : '')}
                    />
                </div>
            </div>}
            {/* {addItemForm.visible && <div>
                <div {...addItemPos()} style={{ color: 'black', position: 'fixed', top: addItemForm.position.y, left: addItemForm.position.x, zIndex: 3, textAlign: 'center', width: '300px' }}>
                    <span style={{ display: 'inline-block', width: '500px', fontWeight: '700', paddingTop: '0.5rem', userSelect: 'none', textAlign: "center" }}>ADD</span>
                </div>
                <div style={{ position: 'fixed', top: addItemForm.position.y, left: addItemForm.position.x, zIndex: 2 }}>
                    <AddItemContainer
                    // selectedMonth={selectedMonth}
                    />
                </div>
            </div>} */}

            <div className="export-container">
                <div className="orderSheet">
                    <div className='table'>
                        <div className='thead'>
                            <div className='tr'>
                                <div className='th model'>Item</div>
                                {months?.map((month, idx) => (
                                    <div className='th' key={idx}>{month}</div>
                                ))}
                            </div>

                        </div>
                        <div className='tbody'>
                            {React.Children.toArray(orderdata)}
                        </div>
                    </div>
                </div>
                <div className="summary">
                    <div className='buttons'>
                        <label htmlFor="orders">Order 입력 <img src='/images/excel_btn.png' alt='excel'></img></label>
                        <input type="file" name="orders" id="orders" onChange={onChangeOrder} ref={orderInput} />
                        <label htmlFor="parts">아이템 입력 <img src='/images/excel_btn.png' alt='excel'></img></label>
                        <input type="file" name="parts" id="parts" onChange={onChangeItem} ref={itemsInput} />
                    </div>

                    <div className="selector">
                        {months?.map((month, index) =>
                            <div key={index}>
                                <input type="radio" name="month" id={month} value={month}
                                    defaultChecked={month === months[0]}
                                    onChange={() => setSelectedMonth(month)} />
                                <label htmlFor={month}>{month}</label>
                            </div>)}
                    </div>

                    <div className={`sumTable ${model}`}>
                        <datalist id="cbm-presets">
                            <option value="0.044">iDT (0.044)</option>
                            <option value="0.040">CC360 (0.040)</option>
                            <option value="0.044">SPT (0.044)</option>
                        </datalist>
                        <div className="arrow">
                            {<span className="material-symbols-outlined back" onClick={() => {
                                setModel('model')
                            }}>
                                arrow_back_ios
                            </span>}
                            {<span className="material-symbols-outlined forward" onClick={() => {
                                setModel('parts')
                            }}>
                                arrow_forward_ios
                            </span>}
                        </div>
                        <div className="modelTable">
                            <div className='repairs'>
                                <div className='header'>
                                </div>
                                <div className='body'>
                                    <div className="titles">
                                        <div className='title check'></div>
                                        <div className='title name'>부자재</div>
                                        <div className='title qty'>수량</div>
                                        <div className='title ct'>C/T</div>
                                        <div className='title weight'>Kg</div>
                                        <div className='title cbm'>cbm</div>
                                        <div className='title action'></div>
                                    </div>
                                    <div className="articles">
                                        {pickedData?.map((picked, index) => <div className={`items`} key={picked.ItemId || picked.id || index}
                                            draggable={!picked.check}
                                            onDragStart={(e) => {
                                                const img = new Image();
                                                img.src = '/images/package.png'
                                                e.dataTransfer.setDragImage(img, 50, 50)
                                                dragItem.current = index

                                            }}
                                            onDragEnter={() => {
                                                dragOverItem.current = index
                                            }}
                                            onDragOver={e => { e.preventDefault() }}
                                            onDrop={() => {
                                                const copyList: any[] = JSON.parse(JSON.stringify(pickedData));
                                                const temp = copyList[dragOverItem.current]
                                                copyList[dragOverItem.current] = copyList[dragItem.current];
                                                copyList[dragItem.current] = temp
                                                dragOverItem.current = null;
                                                dragItem.current = null;
                                                console.log('copyList', copyList)
                                                dispatch(itemActions.changeRepair(copyList))
                                            }}
                                        >
                                            <div className='item check'><input type="checkbox" name="check" id={String(picked.ItemId || picked.id)} checked={picked.check}
                                                onChange={onChangePicked}
                                            /></div>
                                            <div className={`item name ${picked.check ? 'selected' : ''}`}>{picked.itemName}</div>
                                            <div className='item qty'>{
                                                picked.check ? <input type='number' name="quantity" id={String(picked.ItemId || picked.id)} value={picked.quantity !== undefined && picked.quantity !== null ? picked.quantity : ''} onChange={onChangePicked} className='input_qty' /> : (picked.quantity ? picked.quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0')
                                            }</div>
                                            <div className='item ct'>{
                                                picked.check ? <input type='number' name="CT_qty" id={String(picked.ItemId || picked.id)} value={picked.CT_qty || ''} onChange={onChangePicked} className='input_ct' /> : (picked.CT_qty ? picked.CT_qty.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '-')
                                            }</div>
                                            <div className='item weight'>{
                                                picked.check ? <input type='number' name="weight" id={String(picked.ItemId || picked.id)} value={picked.weight || ''} onChange={onChangePicked} className='input_weight' /> : (picked.weight ? Number(picked.weight).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '-')
                                            }</div>
                                            <div className='item cbm'>{
                                                picked.check ?
                                                <input type='text' name='cbm' value={picked.cbm !== undefined && picked.cbm !== null ? picked.cbm : ''} id={String(picked.ItemId || picked.id)} onChange={onChangePicked} className='input_cbm' list="cbm-presets" placeholder="0.000" />
                                                : (picked.cbm ? String(picked.cbm) : '-')
                                            }</div>
                                            <div className={`item action ${picked.check ? 'selected' : ''}`} onClick={() => {
                                                if (!picked.check)
                                                    removePicked(picked.ItemId || picked.id)
                                            }}>
                                                <span className={`material-symbols-outlined trash `}>
                                                    delete
                                                </span>
                                            </div>
                                        </div>)}
                                    </div>
                                </div>
                                <div className='btns'>
                                    <button type='button' onClick={() => handleSelectAll(true)}>전체 선택</button>
                                    <button type='button' onClick={() => handleSelectAll(false)}>전체 취소</button>
                                    <button type='button' onClick={() => {
                                        const result = pickedData?.map(data => ({
                                            id: data.id,
                                            ItemId: data.ItemId,
                                            check: data.check,
                                            itemName: data.itemName,
                                            month: months ? (selectedMonth || months[0]) : '',
                                            quantity: data.quantity,
                                            description: '',
                                            category: 'REPAIR',
                                            unit: '$',
                                            im_price: data.im_price,
                                            ex_price: data.ex_price,
                                            sets: 'EA',
                                            weight: data.weight,
                                            cbm: data.cbm,
                                            CT_qty: data.CT_qty,
                                            number1: 9,
                                            use: true,
                                        }))
                                        if (result) {
                                            inputRepairToOrdersheet(result)
                                        }
                                    }}>저장</button>
                                </div>
                            </div>
                        </div>

                        <div className="partsTable">

                            <div className='repairs'>
                                <div className='header' >
                                    <div className='input_types'>
                                        <div className='input_type'>
                                            <div>
                                                <label htmlFor='exNo'>출고넘버</label>
                                            </div>
                                            <input type="text" name="" id="exNo" placeholder='EK-' />
                                        </div>
                                        <div className='input_type'>
                                            <div>
                                                <label htmlFor='vess'>Vessel/Voy</label>
                                            </div>
                                            <input type="text" name="" id="vess" />
                                        </div>
                                    </div>

                                    <div>
                                        <div className='radio_type'>
                                            <label htmlFor="boat">Boat</label><input type="radio" name="tr" id="boat" defaultChecked />
                                            <label htmlFor="air">Air</label><input type="radio" name="tr" id="air" />
                                        </div>
                                        <div className='radio_type'>
                                            <label htmlFor="Rohlig">Rohlig</label><input type="radio" name="forw" id="Rohlig" defaultChecked />
                                            <label htmlFor="NNR">NNR</label><input type="radio" name="forw" id="NNR" />
                                        </div>
                                        <div className='radio_type'>
                                            <label htmlFor="fcl">FCL</label><input type="radio" name="ct" id="fcl" />
                                            <label htmlFor="lcl">LCL</label><input type="radio" name="ct" id="lcl" defaultChecked />
                                        </div>
                                    </div>
                                </div>
                                <div className='body'>
                                    <div className="titles">
                                        <div className='title check'></div>
                                        <div className='title name'>제품/부자재</div>
                                        <div className='title qty'>수량</div>
                                        <div className='title ct'>C/T</div>
                                        <div className='title weight'>Kg</div>
                                        <div className='title cbm'>cbm</div>
                                        <div className='title action'></div>
                                    </div>
                                    <div className="articles">
                                        {/* 1. 제품 목록 (좌측 화면의 발주서 제품 및 수량, 패킹 규격) */}
                                        {productPackingData?.map((prod, pIdx) => {
                                            const isChecked = isProductChecked(prod.itemName);
                                            const currentQty = productOverrides[prod.itemName]?.quantity !== undefined
                                                ? productOverrides[prod.itemName]?.quantity
                                                : prod.quantity;
                                            const currentCbm = productOverrides[prod.itemName]?.cbm !== undefined
                                                ? productOverrides[prod.itemName]?.cbm
                                                : prod.cbm;
                                            const currentCT = prod.moq > 0 ? Math.ceil((Number(currentQty) || 0) / prod.moq) : prod.CT_qty;
                                            const currentWeight = currentCT && prod.weight ? (currentCT * prod.weight).toFixed(1) : (prod.weight ? String(prod.weight) : '-');
                                            const calculatedCbm = currentCT && currentCbm ? (currentCT * Number(currentCbm)).toFixed(2) : (currentCbm ? String(currentCbm) : '-');

                                            return (
                                                <div
                                                    className="items product-row"
                                                    key={`prod-${pIdx}`}
                                                    draggable={isChecked}
                                                    onDragStart={(e) => {
                                                        if (!isChecked) return;
                                                        const img = new Image();
                                                        img.src = '/images/package.png';
                                                        e.dataTransfer.setDragImage(img, 50, 50);
                                                        e.dataTransfer.setData('item', JSON.stringify({
                                                            name: prod.itemName,
                                                            totalCT_qty: currentCT,
                                                            CT_qty: currentCT,
                                                            quantity: Number(currentQty) || 0,
                                                            weight: prod.weight,
                                                            moq: prod.moq,
                                                            cbm: Number(currentCbm) || 0,
                                                            sets: prod.sets,
                                                            mode: 'move'
                                                        }));
                                                    }}
                                                >
                                                    <div className='item check'>
                                                        <input
                                                            type="checkbox"
                                                            name="check"
                                                            id={`prod-check-${pIdx}`}
                                                            checked={isChecked}
                                                            onChange={() => toggleProductCheck(prod.itemName)}
                                                            style={{ accentColor: '#1976d2', cursor: 'pointer' }}
                                                        />
                                                    </div>
                                                    <div className={`item name ${isChecked ? 'selected' : ''}`} style={{ fontWeight: isChecked ? 700 : 400 }}>
                                                        <span style={{
                                                            fontSize: '0.7rem',
                                                            padding: '1px 5px',
                                                            borderRadius: '3px',
                                                            backgroundColor: '#e3f2fd',
                                                            color: '#1565c0',
                                                            fontWeight: 700,
                                                            marginRight: '6px',
                                                            display: 'inline-block'
                                                        }}>제품</span>
                                                        {prod.itemName}
                                                    </div>
                                                    <div className='item qty'>
                                                        {isChecked ? (
                                                            <input
                                                                type="number"
                                                                name="quantity"
                                                                value={currentQty !== undefined && currentQty !== null ? currentQty : ''}
                                                                onChange={(e) => handleProductOverride(prod.itemName, 'quantity', e.target.value)}
                                                                className="input_qty"
                                                            />
                                                        ) : (
                                                            currentQty ? currentQty.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0'
                                                        )}
                                                    </div>
                                                    <div className='item ct'>{currentCT ? currentCT.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '-'}</div>
                                                    <div className='item weight'>{currentWeight.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
                                                    <div className='item cbm'>
                                                        {isChecked ? (
                                                            <input
                                                                type="text"
                                                                name="cbm"
                                                                value={currentCbm !== undefined && currentCbm !== null ? currentCbm : ''}
                                                                onChange={(e) => handleProductOverride(prod.itemName, 'cbm', e.target.value)}
                                                                className="input_cbm"
                                                                list="cbm-presets"
                                                                placeholder="0.000"
                                                            />
                                                        ) : (
                                                            calculatedCbm
                                                        )}
                                                    </div>
                                                    <div className='item action'></div>
                                                </div>
                                            );
                                        })}

                                        {/* 2. 부자재 목록 (Item Master에서 선택한 부자재 및 C/T, Kg, CBM) */}
                                        {pickedData?.map((picked, index) => <div className={`items sub-material-row`} key={picked.ItemId || picked.id || index}

                                            draggable={picked.check}
                                            onDragStart={(e) => {
                                                const img = new Image();
                                                img.src = '/images/package.png'
                                                e.dataTransfer.setDragImage(img, 50, 50)
                                                dragItem.current = index
                                                if (partPackaging) {
                                                    e.dataTransfer.setData('item',
                                                        JSON.stringify({ summary: partPackaging[picked.id], key: picked.id, data: partPackaging, mode: 'repair' }))
                                                }
                                            }}
                                            onDragEnter={() => {
                                                dragOverItem.current = index
                                            }}
                                            onDragOver={e => { e.preventDefault() }}
                                            onDrop={() => {
                                                const copyList: any[] = JSON.parse(JSON.stringify(pickedData));
                                                const temp = copyList[dragOverItem.current]
                                                copyList[dragOverItem.current] = copyList[dragItem.current];
                                                copyList[dragItem.current] = temp
                                                dragOverItem.current = null;
                                                dragItem.current = null;
                                                // console.log('copyList', copyList)
                                                dispatch(itemActions.changeRepair(copyList))
                                            }}
                                        >
                                            <div className='item check'><input type="checkbox" name="check" id={String(picked.ItemId || picked.id)} checked={picked.check}
                                                onChange={onChangePicked}
                                            /></div>
                                            <div className={`item name ${picked.check ? 'selected' : ''}`}>
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    padding: '1px 5px',
                                                    borderRadius: '3px',
                                                    backgroundColor: '#fce4ec',
                                                    color: '#c2185b',
                                                    fontWeight: 700,
                                                    marginRight: '6px',
                                                    display: 'inline-block'
                                                }}>부자재</span>
                                                {picked.itemName}
                                            </div>
                                            <div className='item qty'>{
                                                picked.check ? <input type='number' name="quantity" id={String(picked.ItemId || picked.id)} value={picked.quantity !== undefined && picked.quantity !== null ? picked.quantity : ''} onChange={onChangePicked} className='input_qty' /> : (picked.quantity ? picked.quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0')
                                            }</div>
                                            <div className='item ct'>{
                                                picked.check ? <input type='number' name="CT_qty" id={String(picked.ItemId || picked.id)} value={picked.CT_qty || ''} onChange={onChangePicked} className='input_ct' /> : (picked.CT_qty ? picked.CT_qty.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '-')
                                            }</div>
                                            <div className='item weight'>{
                                                picked.check ? <input type='number' name="weight" id={String(picked.ItemId || picked.id)} value={picked.weight || ''} onChange={onChangePicked} className='input_weight' /> : (picked.weight ? Number(picked.weight).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '-')
                                            }</div>
                                            <div className='item cbm'>{
                                                picked.check ?
                                                <input type='text' name='cbm' value={picked.cbm !== undefined && picked.cbm !== null ? picked.cbm : ''} id={String(picked.ItemId || picked.id)} onChange={onChangePicked} className='input_cbm' list="cbm-presets" placeholder="0.000" />
                                                : (picked.cbm ? String(picked.cbm) : '-')
                                            }</div>
                                            <div className={`item action ${picked.check ? 'selected' : ''}`} onClick={() => {
                                                if (!picked.check)
                                                    removePicked(picked.ItemId || picked.id)
                                            }}>
                                                <span className={`material-symbols-outlined trash `}>
                                                    delete
                                                </span>
                                            </div>
                                        </div>)}
                                    </div>
                                </div>
                                <div className='btns'>
                                    <button type='button' onClick={() => handleSelectAll(true)}>전체 선택</button>
                                    <button type='button' onClick={() => handleSelectAll(false)}>전체 취소</button>
                                    <button type='button' onClick={() => {
                                        const result = pickedData?.map(data => ({
                                            id: data.id,
                                            ItemId: data.ItemId,
                                            check: data.check,
                                            itemName: data.itemName,
                                            month: months ? (selectedMonth || months[0]) : '',
                                            quantity: data.quantity,
                                            description: '',
                                            category: 'REPAIR',
                                            unit: '$',
                                            im_price: data.im_price,
                                            ex_price: data.ex_price,
                                            sets: 'EA',
                                            weight: data.weight,
                                            cbm: data.cbm,
                                            CT_qty: data.CT_qty,
                                            number1: 9,
                                            use: true,
                                        }))
                                        if (result) {

                                            inputRepairToOrdersheet(result)

                                        }
                                    }}>저장</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='forms'>
                        {(orderData) && <span className="material-symbols-outlined invoice" onClick={() => {
                            bringToFront('invoice');
                            openInvoiceForm();
                        }}>
                            list_alt_add
                        </span>}
                        {(orderData) && <span className="material-symbols-outlined packing" onClick={() => {
                            bringToFront('pallet');
                            bringToFront('packing');
                            openPackingForm();
                        }}>
                            list_alt_add
                        </span>}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ExportComponent;