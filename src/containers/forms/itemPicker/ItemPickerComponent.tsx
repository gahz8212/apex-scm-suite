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
        unit: string,
        im_price: number,
        ex_price: number;
        quantity: number;
        CT_qty: number;
        weight: number;
        cbm: number;
    }[] | null;
    initPicked: () => void;
    onChange: (e: any) => void;
}
const ItemPickerComponent: React.FC<Props> = ({ addPicked, removePicked, pickedData, inputPicked, initPicked, onChange }) => {
    return (
        <div className='wrap-picker'>
            <div className='title'>아이템 수집</div>
            <div className='header'>
                {/* <div>ID</div> */}
                <div>품명</div>
                <div>입고단가</div>
                <div>수출단가</div>
                <div>수출수량</div>

            </div>
            <div className="itemList"
                onDragOver={e => { e.preventDefault() }}
                onDrop={e => {
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
                {pickedData && pickedData.map((picked) => <div key={picked.itemName} className='pickedList'>

                    {/* <div>{picked.ItemId}</div> */}
                    <div>{picked.itemName}</div>
                    <div>{formatCurrencySymbol(picked.unit)}{picked.im_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
                    <div>${picked.ex_price}</div>
                    <div><input type='text' name='quantity' min={0} value={picked.quantity} id={picked.ItemId.toString()} placeholder='수량을 입력 하세요' onChange={onChange} /></div>
                    <div className='trashBtn'
                        onClick={() => removePicked(picked.ItemId)}>
                        <span className="material-symbols-outlined">
                            delete
                        </span>
                    </div>
                </div>)}

            </div>
            <div className="controls">

                <button type="button" onClick={initPicked}>초기화</button>
                <button type="button" onClick={inputPicked}>입력</button>
            </div>
            <div className="bar-btn">
                <button>X</button>
            </div>
        </div>
    );
};

export default ItemPickerComponent;