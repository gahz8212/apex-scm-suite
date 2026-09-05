import React, { useState } from 'react';
import { select_modelname } from '../../../lib/utils/parseModelName'
type Props = {
    items: {
        id: number,
        type: string,
        category: string,
        itemName: string,
        descript: string,
        unit: string,
        sum_im_price: number;
        im_price: number;
        ex_price: number;
        use: boolean,
        supplyer: string,
        Images: { url: string }[],
        Good: { groupName: string },
        left: number,
        top: number,
        point: number,
        // visible: boolean;

    }[] | null;
    selectItem: (id: number) => void;
    dragItem: (id: number) => void;
    onDrop: () => void;
    viewMode: boolean;
    relations: { UpperId: number; LowerId: number; }[] | null;
    showRelate: (id: number, type: string, event: any, visible: boolean) => void;
    totalPrice: { [key: number]: number } | undefined;

}

const CardComponent: React.FC<Props> = ({ items, selectItem, dragItem, onDrop, viewMode, relations, showRelate, totalPrice }) => {


    const [selected, setSelected] = useState<number | ''>()
    const [shows, setShows] = useState<number[]>([])
    const [visibles, setVisibles] = useState<number[]>([])
    const [relateVisible, setRelateVisible] = useState(false)
    const onDragStart = (index: number) => {
        dragItem(index);
    }

    const showBack = (id: number) => {
        if (!shows.includes(id)) {
            setShows([id, ...shows])
        }
    }
    const removeBack = (id: number) => {
        setShows(shows.filter(show => show !== id))
    }
    const checkedItem = (id: number) => {
        // console.log(id)
        const visibleIds = relations?.filter(rel => rel.UpperId === id).map(rel => rel.LowerId)
        if (viewMode) {
            if (visibles.length === 0 && visibleIds) {
                setVisibles([...visibles, ...visibleIds])
            }
            else {
                setVisibles([])
            }
        }
    }
    return (
        <>
            {viewMode ? <div className="item-list"
                style={{ position: 'relative' }}>
                {items?.map((item, index) =>
                    <div
                        key={index}
                        className={`infos 
                    ${selected === item.id ? 'selected' : ''} 
                    ${shows.includes(item.id) ? 'back' : ""}
                    ${item.category}
                    ${visibles.includes(item.id) && item.type === 'PARTS' ? 'visible' : ""}
                ${item.type === 'SET' ? 'SET' : item.type === 'ASSY' ? 'ASSY' : 'PARTS'}
                ${viewMode === true ? 'absolute' : 'relative'}`
                        }
                        style={{ position: 'absolute', left: item.left * 1.5, top: item.top * 1.7 }}
                        draggable
                        onDragStart={(e) => {
                            onDragStart(item.id);
                            let img = new Image();
                            img.src = './images/package.png'
                            e.dataTransfer.setDragImage(img, 100, 100)
                        }}
                        onDragEnd={onDrop}

                    >
                        <div className={`info text `}>
                            <div className="footer">

                                {item.type !== 'SET' && <div className="edit">
                                    <span className="material-symbols-outlined edit" onClick={() => {

                                        selectItem(item.id);
                                        setSelected(item.id)
                                    }}>
                                        Edit
                                    </span>
                                </div>}
                                <div className="check">
                                    <span className="material-symbols-outlined check" onClick={() => { alert('aaa'); checkedItem(item.id); setSelected(item.id) }}>
                                        Check
                                    </span>
                                </div>
                                <div className="redo">
                                    <span className="material-symbols-outlined redo" onClick={() => { showBack(item.id) }}>
                                        Redo
                                    </span>
                                </div>
                            </div>
                            {/* <div>{select_modelname(item.itemName)}</div> */}
                            <div>{item.id}</div>
                            <div>{item.itemName}</div>
                            {/* {item.type !== 'SET' && <div>{item.unit === '\\' ? '￦' : item.unit}{item.im_price}</div>} */}
                            {item.type !== 'SET' &&
                                <>
                                    {item.im_price > 0 && <div><div>입고단가:</div>{item.unit === '\\' ? '￦' : item.unit}{item.im_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>}
                                    <div className="badge">
                                        <div className='point'>x{item.point}</div>
                                    </div>
                                </>}
                            {item.type !== 'PARTS' && <div><div>합산단가:</div> {item.unit}{totalPrice && totalPrice[item.id] > 0 ? totalPrice && totalPrice[item.id].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0}</div>}

                            {item.ex_price > 0 && <div><div>수출단가:</div>${item.ex_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>}

                        </div>
                        <div className={`info image`}>
                            <div className="undo">
                                <span className="material-symbols-outlined undo" onClick={() => { removeBack(item.id) }}>
                                    Undo
                                </span>
                            </div>
                            {item.Images && item.Images.length > 0 && <img src={item.Images[0].url} alt='' width="100%"></img>}

                        </div>
                    </div>)}
            </div > :
                //viewMode가 false일때
                <div className="item-list">

                    {items?.map((item, index) =>
                        <div
                            key={index}
                            className={`infos 
                    ${selected === item.id ? 'selected' : ''} 
                    ${shows.includes(item.id) ? 'back' : ""}
                    ${visibles.includes(item.id) ? 'visible' : ""}
                    ${item.category}
                    ${item.type === 'SET' ? 'SET' : item.type === 'ASSY' ? 'ASSY' : 'PARTS'}`}
                            draggable
                            onDragStart={(e) => {
                                onDragStart(item.id)
                                const img = new Image();
                                img.src = './images/package.png'
                                e.dataTransfer.setDragImage(img, 50, 50)
                                e.dataTransfer.setData('pickedItem', JSON.stringify(
                                    {
                                        ItemId: item.id,
                                        itemName: item.itemName,
                                        unit: item.unit,
                                        im_price: item.im_price,
                                        ex_price: item.ex_price,
                                    }))
                            }}
                            onDragEnd={onDrop}
                        >
                            <div className={`info text`}>

                                <div>{item.id}</div>
                                {/* <div>{item.category}</div> */}

                                {/* <div>{select_modelname(item.itemName) || (item.itemName)}</div> */}
                                <div>{(item.itemName)}</div>

                                {item.type !== 'PARTS' && <div>합산단가: {item.unit}{totalPrice && totalPrice[item.id] > 0 ? totalPrice && totalPrice[item.id].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0}</div>}
                                {item.im_price > 0 && <div>입고단가: \{item.im_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>}
                                {item.ex_price > 0 && <div>수출단가: ${item.ex_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>}
                                <div className="footer">
                                    <div className="edit">
                                        <span className="material-symbols-outlined edit" onClick={() => {
                                            selectItem(item.id);
                                            setSelected(item.id)
                                        }}>
                                            Edit
                                        </span>
                                    </div>
                                    <div className="check">
                                        <span className="material-symbols-outlined check" onClick={(e: any) => {
                                            setRelateVisible(!relateVisible)
                                            showRelate(item.id, item.type, e, relateVisible);
                                            setSelected(item.id)
                                        }}>
                                            Check
                                        </span>
                                    </div>
                                    <div className="redo">
                                        <span className="material-symbols-outlined redo" onClick={() => { showBack(item.id) }}>
                                            Redo
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className={`info image  `}>
                                {(item.Images && item.Images.length > 0) && <img src={item.Images[0].url} alt=''  ></img>}
                                <div className="undo">
                                    <span className="material-symbols-outlined undo" onClick={() => { removeBack(item.id) }}>
                                        Undo
                                    </span>
                                </div>

                            </div>
                        </div>)}
                </div >
            }</>
    );
};

export default CardComponent;