import React, { useState, useRef } from 'react';
import InvoiceContainer from '../forms/invoiceForm/InvoiceContainer';
import PackingContainer from '../forms/packingListForm/PackingContainer';
import AddItemContainer from '../forms/addItemForm/AddItemContainer';
import PalletContainer from '../forms/packingListForm/PalletContainer';
import { useDrag } from 'react-use-gesture';
import { OrderAction } from '../../store/slices/orderSlice'
import { useDispatch } from 'react-redux'
import { itemActions } from '../../store/slices/itemSlice';
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
    const invoicePos = useDrag((params => { changePosition('invoice', { x: params.offset[0] + 100, y: params.offset[1] + 200 }) }))
    const packingPos = useDrag((params => { changePosition('packing', { x: params.offset[0] + 820, y: params.offset[1] + 200 }) }))
    const palletPos = useDrag((params => { changePosition('pallet', { x: params.offset[0] + 1400, y: params.offset[1] + 200 }) }))
    const addItemPos = useDrag((params => { changePosition('addItem', { x: params.offset[0] + 100, y: params.offset[1] + 200 }) }))
    // let dragItemKey = '';
    // let dragOverItemKey = ''
    // console.log(pickedData)
    let orderdata;
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null)


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
            {invoiceForm.visible && <div>
                <div {...invoicePos()} style={{
                    color: 'black',
                    position: 'fixed',
                    top: invoiceForm.position.y,
                    left: invoiceForm.position.x,
                    zIndex: 4,
                    textAlign: 'center',
                    width: '520px',
                    boxSizing: 'border-box'
                }}>
                    <div style={{ width: '520px', padding: '1rem', userSelect: 'none' }}></div>
                </div>
                <div style={{ position: 'fixed', top: invoiceForm.position.y, left: invoiceForm.position.x, zIndex: 2 }}>
                    <InvoiceContainer selectedMonth={selectedMonth || months![0]} />
                </div>
            </div>}
            {packingForm.visible && <div>
                <div {...packingPos()} style={{
                    color: 'black',
                    width: '520px',
                    position: 'fixed',
                    top: packingForm.position.y,
                    left: packingForm.position.x,
                    zIndex: 4,
                    textAlign: 'center',
                    boxSizing: 'border-box'
                }}>
                    <div style={{ width: '520px', padding: '1rem', userSelect: 'none' }}></div>
                </div>
                <div style={{ position: 'fixed', top: packingForm.position.y, left: packingForm.position.x, zIndex: 2 }}>
                    <PackingContainer
                        selectedMonth={selectedMonth || months![0]}
                    />
                </div>
            </div>}
            {palletForm.visible && <div>
                <div {...palletPos()} style={{
                    color: 'black',
                    width: '650px',
                    position: 'fixed',
                    top: palletForm.position.y,
                    left: palletForm.position.x,
                    zIndex: 4,
                    textAlign: 'center',
                    boxSizing: 'border-box'

                }}>
                    <div style={{
                        width: '650px',
                        padding: '1rem',
                        userSelect: 'none',

                    }}></div>
                </div>
                <div style={{ position: 'fixed', top: palletForm.position.y, left: palletForm.position.x, zIndex: 2 }}>
                    <PalletContainer
                        selectedMonth={selectedMonth || months![0]}
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

                    <div className={`sumTable  ${model === 'parts' ? "model" : 'parts'}`}>
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
                                        <div className='title'>부자재</div>
                                        <div className='title'>수량</div>
                                        <div className='title'>C/T</div>
                                        <div className='title'>Kg</div>
                                        <div className='title'>cbm</div>
                                    </div>
                                    <div className="articles">
                                        {pickedData?.map((picked, index) => <div className={`items`} key={picked.ItemId}
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
                                                const copyList: { id: number; ItemId: number; check: boolean; itemName: string; unit: string; im_price: number; ex_price: number; quantity: number; CT_qty: number; weight: number; cbm: number; }[] = JSON.parse(JSON.stringify(pickedData));
                                                const temp = copyList[dragOverItem.current]
                                                copyList[dragOverItem.current] = copyList[dragItem.current];
                                                copyList[dragItem.current] = temp
                                                dragOverItem.current = null;
                                                dragItem.current = null;
                                                console.log('copyList', copyList)
                                                dispatch(itemActions.changeRepair(copyList))
                                            }}
                                        >
                                            <div className='item'><input type="checkbox" name="check" id={String(picked.ItemId)} checked={picked.check}
                                                onChange={onChangePicked}
                                            /></div>
                                            <div className={`item ${picked.check ? 'selected' : ''}`}>{picked.itemName}</div>
                                            <div className='item'>{picked.quantity ? picked.quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0}</div>
                                            <div className='item'>{
                                                picked.check && <input type='number' name="CT_qty" id={picked.ItemId.toString()} value={picked.CT_qty} onChange={onChangePicked} className='input_ct' ></input>
                                            }</div>
                                            <div className='item'>{
                                                picked.check && <input type='number' name="weight" id={String(picked.ItemId)} value={picked.weight} onChange={onChangePicked} className='input_weight'></input>
                                            }</div>
                                            <div className='item'>{
                                                picked.check &&
                                                <select className='sel_cbm' name='cbm' value={picked.cbm} id={String(picked.ItemId)} onChange={onChangePicked}>
                                                    <option value="선택">선택</option>
                                                    <option value="0.044">iDT</option>
                                                    <option value="0.04">CC360</option>
                                                    <option value="0.044">SPT</option>
                                                </select>}</div>
                                            <div className={`item ${picked.check ? 'selected' : ''}`} onClick={() => {
                                                if (!picked.check)
                                                    removePicked(picked.ItemId)
                                            }}>
                                                <span className={`material-symbols-outlined trash `}>
                                                    delete
                                                </span>
                                            </div>
                                        </div>)}
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
                                            <label htmlFor="boat">Boat</label><input type="radio" name="tr" id="boat" checked />
                                            <label htmlFor="air">Air</label><input type="radio" name="tr" id="air" />
                                        </div>
                                        <div className='radio_type'>
                                            <label htmlFor="Rohlig">Rohlig</label><input type="radio" name="forw" id="Rohlig" checked />
                                            <label htmlFor="NNR">NNR</label><input type="radio" name="forw" id="NNR" />
                                        </div>
                                        <div className='radio_type'>
                                            <label htmlFor="fcl">FCL</label><input type="radio" name="ct" id="fcl" />
                                            <label htmlFor="lcl">LCL</label><input type="radio" name="ct" id="lcl" checked />
                                        </div>
                                    </div>
                                </div>
                                <div className='body'>
                                    <div className="titles">

                                        <div className='title'>부자재</div>
                                        <div className='title'>수량</div>
                                        <div className='title'>C/T</div>
                                        <div className='title'>Kg</div>
                                        <div className='title'>cbm</div>
                                    </div>
                                    <div className="articles">
                                        {pickedData?.map((picked, index) => <div className={`items`} key={picked.ItemId}

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
                                                const copyList: { id: number; ItemId: number; check: boolean; itemName: string; unit: string; im_price: number; ex_price: number; quantity: number; CT_qty: number; weight: number; cbm: number; }[] = JSON.parse(JSON.stringify(pickedData));
                                                const temp = copyList[dragOverItem.current]
                                                copyList[dragOverItem.current] = copyList[dragItem.current];
                                                copyList[dragItem.current] = temp
                                                dragOverItem.current = null;
                                                dragItem.current = null;
                                                console.log('copyList', copyList)
                                                dispatch(itemActions.changeRepair(copyList))
                                            }}
                                        >
                                            <div className='item'><input type="checkbox" name="check" id={String(picked.ItemId)} checked={picked.check}
                                                onChange={onChangePicked}
                                            /></div>
                                            <div className={`item ${picked.check ? 'selected' : ''}`}>{picked.itemName}</div>
                                            <div className='item'>{picked.quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
                                            <div className='item'>{
                                                picked.check && <input type='number' name="CT_qty" id={picked.ItemId.toString()} value={picked.CT_qty} onChange={onChangePicked} className='input_ct' ></input>
                                            }</div>
                                            <div className='item'>{
                                                picked.check && <input type='number' name="weight" id={String(picked.ItemId)} value={picked.weight} onChange={onChangePicked} className='input_weight'></input>
                                            }</div>
                                            <div className='item'>{
                                                picked.check &&
                                                <select className='sel_cbm' name='cbm' value={picked.cbm} id={String(picked.ItemId)} onChange={onChangePicked}>
                                                    <option value="선택">선택</option>
                                                    <option value="0.044">iDT</option>
                                                    <option value="0.04">CC360</option>
                                                    <option value="0.044">SPT</option>
                                                </select>}</div>
                                            <div className={`item ${picked.check ? 'selected' : ''}`} onClick={() => {
                                                if (!picked.check)
                                                    removePicked(picked.ItemId)
                                            }}>
                                                <span className={`material-symbols-outlined trash `}>
                                                    delete
                                                </span>
                                            </div>
                                        </div>)}
                                    </div>
                                </div>
                                <div className='btns'>
                                    <button type='button' onClick={() => setSelect(true)}>전체 선택</button>
                                    <button type='button' onClick={() => setSelect(false)}>전체 취소</button>
                                    <button type='button' onClick={() => {
                                        const result = pickedData?.map(data => ({
                                            id: data.id,
                                            ItemId: data.ItemId,
                                            check: data.check,
                                            itemName: data.itemName,
                                            month: months ? months[0] : '',
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
                        {(orderData) && <span className="material-symbols-outlined invoice" onClick={openInvoiceForm}>
                            list_alt_add
                        </span>}
                        {(orderData) && <span className="material-symbols-outlined packing" onClick={openPackingForm}>
                            list_alt_add
                        </span>}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ExportComponent;