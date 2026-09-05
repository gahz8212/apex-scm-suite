
import React, { useState } from 'react';
import { select_modelname } from '../../../lib/utils/parseModelName'
type Props = {
    palletData: {
        [key: number]: { [key: string]: string | number; }[]
    }
    settingPallet: (Pnumber: number, itemData: { item: string, CT_qty: number, quantity: number, weight: number, moq: number, cbm: number, sets: string, mode: string }) => void
    addCount: (id: number, item: string, value: number) => void;
    removeCount: (id: number, item: string, value: number) => void;
    onInputPallet: () => void
    removeItem: (id: number, item: string) => void
    resetPallet: () => void
}
type Items = {
    items: {
        [key: string]: string | number;
    }[];
    addCount: (id: number, item: string, value: number) => void;
    removeCount: (id: number, item: string, value: number) => void;
    removeItem: (id: number, item: string) => void;
    index: number;
    resetPallet: () => void
}
const PalletItems: React.FC<Items> = ({ items, addCount, removeCount, index, removeItem, resetPallet }) => {
    const [inter, setInter] = useState<NodeJS.Timeout | undefined>(undefined)
    const [tout, setTout] = useState<NodeJS.Timeout | undefined>(undefined)

    function inCrease(id: number, item: string, value: number) {
        setTout(setTimeout(() => {
            setInter(
                setInterval(() => {
                    addCount(id, item, value)
                }, 100))
        }, 500))
    }

    function deCrease(id: number, item: string, value: number) {
        setTout(setTimeout(() => {
            setInter(
                setInterval(() => {
                    removeCount(id, item, value)
                }, 100))
        }, 500))
    }
    return <div>
        {items.map(item => item.item && <div
            className='elem-pallet'
            draggable
            onDragStart={(e) => {
                const img = new Image();
                img.src = './images/package.png'
                e.dataTransfer.setDragImage(img, 50, 50)
                e.dataTransfer.setData('item', JSON.stringify({
                    name: item.item,
                    CT_qty: item.CT_qty,
                    quantity: item.quantity,
                    weight: item.weight,
                    moq: item.moq,
                    cbm: item.cbm,
                    sets: item.sets,
                    mode: 'copy'
                }))
                clearInterval(inter)
            }}
        >
            <span className='modelName'>
                {typeof item.item === 'string' &&
                    select_modelname(item.item)
                }
            </span>
            {item.CT_qty ? <div className='material-symbols' >
                <span className="material-symbols-outlined add"
                    onClick={() => {
                        if (typeof item.item === 'string' && typeof item.CT_qty === 'number')
                            addCount(index, item.item, item.CT_qty)
                    }}
                    onMouseDown={() => {
                        if (typeof item.item === 'string' && typeof item.CT_qty === 'number')
                            inCrease(index, item.item, item.CT_qty)
                    }}
                    onMouseUp={() => {
                        clearInterval(inter)
                        clearTimeout(tout)
                    }}
                >
                    add_circle
                </span>
                <span className='CT_qty'>{item.CT_qty}</span>
                <span className="material-symbols-outlined remove "

                    onClick={() => {
                        if (typeof item.item === 'string' && typeof item.CT_qty === 'number') {
                            removeCount(index, item.item, item.CT_qty)
                        }

                        if (item.CT_qty === 1) {

                            // eslint-disable-next-line no-restricted-globals
                            let result = confirm('이 품목을 삭제합니까?')
                            if (result) {
                                if (typeof item.item === 'string') {
                                    removeItem(index, item.item)
                                }
                            }
                        }
                    }}
                    onMouseDown={() => {
                        if (typeof item.item === 'string' && typeof item.CT_qty === 'number')
                            deCrease(index, item.item, item.CT_qty)
                    }}
                    onMouseUp={() => {
                        clearInterval(inter)
                        clearTimeout(tout)
                    }}

                >
                    do_not_disturb_on
                </span>
            </div> : <div><span className="material-symbols-outlined remove repair"
                onClick={() => {
                    // eslint-disable-next-line no-restricted-globals
                    let result = confirm('이 품목을 삭제합니까?')
                    if (result) {
                        if (typeof item.item === 'string') {
                            removeItem(index, item.item)
                        }
                    }
                }
                }
            >
                delete
            </span></div>}
        </div>)
        }
    </div >
}
const PalletComponent: React.FC<Props> = ({ palletData, settingPallet, addCount, removeCount, onInputPallet, removeItem, resetPallet }) => {

    const drop = (index: number, itemName: { name: string, CT_qty: number, quantity: number, weight: number, moq: number, cbm: number, sets: string, mode: string }) => {
        settingPallet(index, {
            item: itemName.name,
            CT_qty: itemName.CT_qty, quantity: itemName.quantity, weight: itemName.weight,
            moq: itemName.moq, cbm: itemName.cbm, sets: itemName.sets, mode: itemName.mode
        })
    }
    const values = Object.values(palletData)
    if (!palletData) { return null }
    return (
        <div className='wrap-pallets'>
            <div className="title">PALLET</div>
            <div className='wrap-pallet'>
                {values.map((data, index) => <div
                    className='outline-pallet'

                    key={index}
                    onDragLeave={(e) => { e.currentTarget.style.background = "white" }}
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.background = "pink"
                    }}
                    onDrop={(e) => {
                        const { name, CT_qty, quantity, weight, moq, cbm, sets, mode } = JSON.parse(e.dataTransfer.getData('item'))

                        if (mode === 'move' || mode === 'copy') {

                            // const { summary, key, data, mode } = JSON.parse(e.dataTransfer.getData('item'))
                            // console.log(summary[0])
                            drop(index, { name, CT_qty, quantity, weight, moq, cbm, sets, mode })
                        } else {
                            const { summary, key, data, mode } = JSON.parse(e.dataTransfer.getData('item'));
                            summary.sort((a: { id: number }, b: { id: number }) => b.id - a.id).map((data: {
                                itemName: string,
                                CT_qty: number,
                                quantity: number,
                                weight: number,
                                moq: number,
                                cbm: number,
                                sets: string,
                                mode: string
                            }) => drop(index, { name: data.itemName, CT_qty: data.CT_qty, quantity: data.quantity, weight: data.weight, moq: data.moq, cbm: data.cbm, sets: data.sets, mode: data.mode }))

                        }
                        e.currentTarget.style.background = "white"
                    }}
                >
                    <div style={{ position: 'absolute', left: index < 9 ? "40%" : "30%", fontSize: '80px', opacity: '.1', userSelect: 'none' }}>
                        {index + 1}
                    </div>
                    <PalletItems items={data} addCount={addCount} removeCount={removeCount} index={index} removeItem={removeItem} resetPallet={resetPallet} />
                </div>)}
            </div>
            <button onClick={resetPallet}>초기화</button>
            <button onClick={onInputPallet}>입력</button>
        </div>
    );
}
export default PalletComponent;