import React, { useState, useMemo, useEffect } from 'react';
import InvoiceContainer from '../forms/invoiceForm/InvoiceContainer';
import PackingContainer from '../forms/packingListForm/PackingContainer';
import PalletContainer from '../forms/packingListForm/PalletContainer';
import { useDrag } from 'react-use-gesture';
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
    // const addItemPos = useDrag(params => {
    //     const nextX = Math.max(10, Math.min(window.innerWidth - 400, params.offset[0] + 100));
    //     const nextY = Math.max(70, Math.min(window.innerHeight - 200, params.offset[1] + 120));
    //     changePosition('addItem', { x: nextX, y: nextY });
    // });
    // let dragItemKey = '';
    // let dragOverItemKey = ''
    // console.log(pickedData)
    let orderdata;
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const activeMonth = selectedMonth || (months && months.length > 0 ? months[0] : '');

    const productPackingData = useMemo(() => {
        if (!orderData || !activeMonth) return [];
        const packingItems = calculatePackingData(orderData, activeMonth);
        const map = new Map<string, any>();
        packingItems.forEach(p => {
            const existing = map.get(p.itemName);
            if (existing) {
                existing.quantity += p.quantity;
                existing.CT_qty += p.CT_qty;
            } else {
                const orderItem = orderData.find((o: any) => o.itemName === p.itemName);
                map.set(p.itemName, {
                    ...p,
                    itemName: p.itemName,
                    groupName: p.groupName || orderItem?.groupName,
                    quantity: p.quantity,
                    CT_qty: p.CT_qty,
                    weight: p.weight,
                    cbm: p.cbm,
                    moq: p.moq,
                    sets: p.sets,
                    ex_price: p.ex_price || orderItem?.ex_price || 0,
                    category: p.category || orderItem?.category || 'EDT'
                });
            }
        });
        return Array.from(map.values());
    }, [orderData, activeMonth]);

    const getDtName = (prod: any) => {
        if (prod.groupName) return prod.groupName;
        const fromOrder = orderData?.find((o: any) => o.itemName === prod.itemName)?.groupName;
        if (fromOrder) return fromOrder;
        if (prod.itemName) {
            const cleaned = prod.itemName.replace(/\s+(PRO|MINI|SMART)?\s*SET$/i, '').trim();
            if (cleaned) return cleaned;
        }
        return prod.itemName;
    };

    const [checkedProducts, setCheckedProducts] = useState<{ [itemName: string]: boolean }>({});
    const [productOverrides, setProductOverrides] = useState<{
        [itemName: string]: {
            quantity?: number | string;
            CT_qty?: number | string;
            weight?: number | string;
            cbm?: string;
        }
    }>({});

    useEffect(() => {
        setCheckedProducts({});
        setProductOverrides({});
    }, [activeMonth]);

    const isProductChecked = (itemName: string): boolean => {
        return checkedProducts[itemName] !== undefined ? checkedProducts[itemName] : true;
    };

    const currentExportData = useMemo(() => {
        if (!activeMonth) return [];

        const checkedProductItems = productPackingData
            .filter(prod => (checkedProducts[prod.itemName] !== undefined ? checkedProducts[prod.itemName] : true))
            .map(prod => {
                const override = productOverrides[prod.itemName];
                const currentQty = override?.quantity !== undefined ? (override.quantity !== '' ? Number(override.quantity) : 0) : Number(prod.quantity);
                const currentCT = override?.CT_qty !== undefined ? (override.CT_qty !== '' ? Number(override.CT_qty) : 0) : Number(prod.CT_qty || 0);
                const currentWeight = override?.weight !== undefined ? (override.weight !== '' ? Number(override.weight) : 0) : (prod.CT_qty && prod.weight ? Number((prod.CT_qty * prod.weight).toFixed(1)) : Number(prod.weight || 0));
                const currentCbm = override?.cbm !== undefined ? (Number(override.cbm) > 0 ? Number(override.cbm) : 0) : (Number(prod.cbm) > 0 ? Number(prod.cbm) : 0);
                const unitWeight = currentCT > 0 ? currentWeight / currentCT : (Number(prod.weight) || 0);

                return {
                    ...prod,
                    [activeMonth]: currentQty,
                    quantity: currentQty,
                    CT_qty: currentCT,
                    weight: unitWeight,
                    totalWeight: currentWeight,
                    cbm: currentCbm,
                    ex_price: Number(prod.ex_price) || 0,
                    sets: prod.sets || 'SET',
                    moq: prod.moq || (currentCT > 0 ? currentQty / currentCT : 0),
                    isSubMaterial: false,
                    isDirect: true
                };
            });

        const checkedSubMaterialItems = (pickedData || [])
            .filter(picked => picked.check)
            .map(picked => {
                const qty = Number(picked.quantity) || 0;
                const ct = Number(picked.CT_qty) || 0;
                const wt = Number(picked.weight) || 0;
                const unitWeight = ct > 0 ? wt / ct : wt;
                const cbmVal = Number(picked.cbm) > 0 ? Number(picked.cbm) : 0;

                return {
                    ...picked,
                    [activeMonth]: qty,
                    quantity: qty,
                    CT_qty: ct,
                    weight: unitWeight,
                    totalWeight: wt,
                    cbm: cbmVal,
                    ex_price: Number(picked.ex_price) || 0,
                    sets: (picked as any).sets || 'EA',
                    moq: (picked as any).moq || (ct > 0 ? qty / ct : 0),
                    category: 'REPAIR',
                    isSubMaterial: true,
                    isDirect: true
                };
            });

        return [...checkedProductItems, ...checkedSubMaterialItems];
    }, [productPackingData, checkedProducts, productOverrides, pickedData, activeMonth]);

    const toggleProductCheck = (itemName: string) => {
        setCheckedProducts(prev => ({
            ...prev,
            [itemName]: !isProductChecked(itemName)
        }));
    };

    const handleProductQtyChange = (prod: any, value: string) => {
        if (value === '') {
            setProductOverrides(prev => ({
                ...prev,
                [prod.itemName]: {
                    ...prev[prod.itemName],
                    quantity: '',
                    CT_qty: '',
                    weight: ''
                }
            }));
            return;
        }
        const qty = Number(value);
        const ct = prod.moq > 0 ? Math.ceil(qty / prod.moq) : (prod.CT_qty || 1);
        const wt = prod.weight ? Number((ct * prod.weight).toFixed(1)) : (prod.weight || 0);
        setProductOverrides(prev => ({
            ...prev,
            [prod.itemName]: {
                ...prev[prod.itemName],
                quantity: qty,
                CT_qty: ct,
                weight: wt
            }
        }));
    };

    const handleProductCTChange = (itemName: string, value: string) => {
        setProductOverrides(prev => ({
            ...prev,
            [itemName]: {
                ...prev[itemName],
                CT_qty: value === '' ? '' : Number(value)
            }
        }));
    };

    const handleProductWeightChange = (itemName: string, value: string) => {
        setProductOverrides(prev => ({
            ...prev,
            [itemName]: {
                ...prev[itemName],
                weight: value === '' ? '' : Number(value)
            }
        }));
    };

    const handleProductCbmChange = (itemName: string, value: string) => {
        setProductOverrides(prev => ({
            ...prev,
            [itemName]: {
                ...prev[itemName],
                cbm: value
            }
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
                    <InvoiceContainer
                        selectedMonth={activeMonth}
                        exportData={currentExportData}
                    />
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
                        selectedMonth={activeMonth}
                        exportData={currentExportData}
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
                        selectedMonth={activeMonth}
                        exportData={currentExportData}
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
                                        <div className='title col-check'></div>
                                        <div className='title col-name'>부자재</div>
                                        <div className='title col-qty'>수량</div>
                                        <div className='title col-ct'>C/T</div>
                                        <div className='title col-weight'>Kg</div>
                                        <div className='title col-cbm'>cbm</div>
                                    </div>
                                    <div className="articles">
                                        {pickedData?.map((picked, index) => (
                                            <div className="items sub-material-row" key={picked.ItemId || picked.id || index}>
                                                <div className='item col-check'>
                                                    <input type="checkbox" name="check" id={String(picked.ItemId || picked.id)} checked={picked.check}
                                                        onChange={onChangePicked}
                                                    />
                                                </div>
                                                <div className={`item col-name ${picked.check ? 'selected' : ''}`} title={picked.itemName}>
                                                    <span className="badge-part">부자재</span>
                                                    <span className="name-text">{picked.itemName}</span>
                                                </div>
                                                <div className='item col-qty'>
                                                    <input
                                                        type="number"
                                                        name="quantity"
                                                        id={String(picked.ItemId || picked.id)}
                                                        value={picked.quantity !== undefined && picked.quantity !== null ? picked.quantity : ''}
                                                        disabled={!picked.check}
                                                        onChange={onChangePicked}
                                                        className="input_box input_qty"
                                                    />
                                                </div>
                                                <div className='item col-ct'>
                                                    <input
                                                        type='number'
                                                        name="CT_qty"
                                                        id={String(picked.ItemId || picked.id)}
                                                        value={picked.CT_qty !== undefined && picked.CT_qty !== null ? picked.CT_qty : ''}
                                                        disabled={!picked.check}
                                                        onChange={onChangePicked}
                                                        className='input_box input_ct'
                                                    />
                                                </div>
                                                <div className='item col-weight'>
                                                    <input
                                                        type='number'
                                                        name="weight"
                                                        id={String(picked.ItemId || picked.id)}
                                                        value={picked.weight !== undefined && picked.weight !== null ? picked.weight : ''}
                                                        disabled={!picked.check}
                                                        onChange={onChangePicked}
                                                        className='input_box input_weight'
                                                    />
                                                </div>
                                                <div className='item col-cbm'>
                                                    <select
                                                        className='input_box sel_cbm'
                                                        name='cbm'
                                                        value={picked.cbm || '선택'}
                                                        id={String(picked.ItemId || picked.id)}
                                                        disabled={!picked.check}
                                                        onChange={onChangePicked}
                                                    >
                                                        <option value="선택">선택</option>
                                                        <option value="0.044">iDT</option>
                                                        <option value="0.04">CC360</option>
                                                        <option value="0.044">SPT</option>
                                                        {picked.cbm && !['0.044', '0.04', 0.044, 0.04, '선택'].includes(picked.cbm) && (
                                                            <option value={String(picked.cbm)}>{picked.cbm}</option>
                                                        )}
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
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
                                        <div className='title col-check'></div>
                                        <div className='title col-name'>제품/부자재</div>
                                        <div className='title col-qty'>수량</div>
                                        <div className='title col-ct'>C/T</div>
                                        <div className='title col-weight'>Kg</div>
                                        <div className='title col-cbm'>cbm</div>
                                    </div>
                                    <div className="articles">
                                        {/* 1. 제품 목록 (좌측 월 데이터 발주 품목) */}
                                        {productPackingData?.map((prod, pIdx) => {
                                            const isChecked = isProductChecked(prod.itemName);
                                            const override = productOverrides[prod.itemName];

                                            const currentQty = override?.quantity !== undefined
                                                ? override.quantity
                                                : prod.quantity;

                                            const currentCT = override?.CT_qty !== undefined
                                                ? override.CT_qty
                                                : prod.CT_qty;

                                            const currentWeight = override?.weight !== undefined
                                                ? override.weight
                                                : (prod.CT_qty && prod.weight ? (prod.CT_qty * prod.weight).toFixed(1) : (prod.weight || 0));

                                            const currentCbm = override?.cbm !== undefined
                                                ? override.cbm
                                                : (prod.cbm ? String(prod.cbm) : '선택');

                                            return (
                                                <div
                                                    className="items product-row"
                                                    key={`prod-${pIdx}`}
                                                >
                                                    <div className='item col-check'>
                                                        <input
                                                            type="checkbox"
                                                            name="check"
                                                            id={`prod-check-${pIdx}`}
                                                            checked={isChecked}
                                                            onChange={() => toggleProductCheck(prod.itemName)}
                                                        />
                                                    </div>
                                                    <div className={`item col-name ${isChecked ? 'selected' : ''}`} title={prod.itemName}>
                                                        <span className="badge-prod">제품</span>
                                                        <span className="name-text">{getDtName(prod)}</span>
                                                    </div>
                                                    <div className='item col-qty'>
                                                        <input
                                                            type="number"
                                                            name="quantity"
                                                            value={currentQty !== undefined && currentQty !== null ? currentQty : ''}
                                                            disabled={!isChecked}
                                                            onChange={(e) => handleProductQtyChange(prod, e.target.value)}
                                                            className="input_box input_qty"
                                                        />
                                                    </div>
                                                    <div className='item col-ct'>
                                                        <input
                                                            type="number"
                                                            name="CT_qty"
                                                            value={currentCT !== undefined && currentCT !== null ? currentCT : ''}
                                                            disabled={!isChecked}
                                                            onChange={(e) => handleProductCTChange(prod.itemName, e.target.value)}
                                                            className="input_box input_ct"
                                                        />
                                                    </div>
                                                    <div className='item col-weight'>
                                                        <input
                                                            type="number"
                                                            name="weight"
                                                            value={currentWeight !== undefined && currentWeight !== null ? currentWeight : ''}
                                                            disabled={!isChecked}
                                                            onChange={(e) => handleProductWeightChange(prod.itemName, e.target.value)}
                                                            className="input_box input_weight"
                                                        />
                                                    </div>
                                                    <div className='item col-cbm'>
                                                        <select
                                                            className='input_box sel_cbm'
                                                            name='cbm'
                                                            value={currentCbm || '선택'}
                                                            disabled={!isChecked}
                                                            onChange={(e) => handleProductCbmChange(prod.itemName, e.target.value)}
                                                        >
                                                            <option value="선택">선택</option>
                                                            <option value="0.044">iDT</option>
                                                            <option value="0.04">CC360</option>
                                                            <option value="0.044">SPT</option>
                                                            {prod.cbm && !['0.044', '0.04', 0.044, 0.04, '선택'].includes(prod.cbm) && (
                                                                <option value={String(prod.cbm)}>{prod.cbm}</option>
                                                            )}
                                                        </select>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* 2. 부자재 목록 (Item Master에서 선택한 부자재) */}
                                        {pickedData?.map((picked, index) => (
                                            <div className="items sub-material-row" key={picked.ItemId || picked.id || index}>
                                                <div className='item col-check'>
                                                    <input
                                                        type="checkbox"
                                                        name="check"
                                                        id={String(picked.ItemId || picked.id)}
                                                        checked={picked.check}
                                                        onChange={onChangePicked}
                                                    />
                                                </div>
                                                <div className={`item col-name ${picked.check ? 'selected' : ''}`} title={picked.itemName}>
                                                    <span className="badge-part">부자재</span>
                                                    <span className="name-text">{picked.itemName}</span>
                                                </div>
                                                <div className='item col-qty'>
                                                    <input
                                                        type="number"
                                                        name="quantity"
                                                        id={String(picked.ItemId || picked.id)}
                                                        value={picked.quantity !== undefined && picked.quantity !== null ? picked.quantity : ''}
                                                        disabled={!picked.check}
                                                        onChange={onChangePicked}
                                                        className="input_box input_qty"
                                                    />
                                                </div>
                                                <div className='item col-ct'>
                                                    <input
                                                        type='number'
                                                        name="CT_qty"
                                                        id={String(picked.ItemId || picked.id)}
                                                        value={picked.CT_qty !== undefined && picked.CT_qty !== null ? picked.CT_qty : ''}
                                                        disabled={!picked.check}
                                                        onChange={onChangePicked}
                                                        className='input_box input_ct'
                                                    />
                                                </div>
                                                <div className='item col-weight'>
                                                    <input
                                                        type='number'
                                                        name="weight"
                                                        id={String(picked.ItemId || picked.id)}
                                                        value={picked.weight !== undefined && picked.weight !== null ? picked.weight : ''}
                                                        disabled={!picked.check}
                                                        onChange={onChangePicked}
                                                        className='input_box input_weight'
                                                    />
                                                </div>
                                                <div className='item col-cbm'>
                                                    <select
                                                        className='input_box sel_cbm'
                                                        name='cbm'
                                                        value={picked.cbm || '선택'}
                                                        id={String(picked.ItemId || picked.id)}
                                                        disabled={!picked.check}
                                                        onChange={onChangePicked}
                                                    >
                                                        <option value="선택">선택</option>
                                                        <option value="0.044">iDT</option>
                                                        <option value="0.04">CC360</option>
                                                        <option value="0.044">SPT</option>
                                                        {picked.cbm && !['0.044', '0.04', 0.044, 0.04, '선택'].includes(picked.cbm) && (
                                                            <option value={String(picked.cbm)}>{picked.cbm}</option>
                                                        )}
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className='btns'>
                                    <button type='button' onClick={() => handleSelectAll(true)}>전체 선택</button>
                                    <button type='button' onClick={() => handleSelectAll(false)}>전체 취소</button>
                                    <button type='button' onClick={() => {
                                        const checkedPicked = pickedData?.filter(data => data.check) || [];
                                        if (checkedPicked.length === 0) {
                                            if (!window.confirm('선택된 항목이 없습니다. 부자재를 모두 제외하고 저장하시겠습니까?')) {
                                                return;
                                            }
                                        }
                                        const result = checkedPicked.map(data => ({
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
                                        }));
                                        inputRepairToOrdersheet(result);
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