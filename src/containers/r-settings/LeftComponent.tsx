import React, { useState, useRef, useEffect } from 'react';
type Props = {
    items: {
        id: number,
        type: string,
        category: string,
        itemName: string,
        descript: string,
        unit: string,
        im_price: number;
        sum_im_price: number;
        ex_price: number;
        use: boolean,
        supplyer: string,
        Images: { url: string }[]

    }[] | null;
    dragItems: { [key: string]: string | number | boolean }[];
    addCount: (targetId: number | string | boolean, itemId: number | string | boolean) => void;
    removeCount: (targetId: number | string | boolean, itemId: number | string | boolean, mode: string) => void;
    drag_on: (targetId: number, itemId: number) => void;
    dragedItem: { id: number } | null;
    viewRelation: (toggle: boolean) => void;
    addRelateGood: (item: { [key: string]: number | string | {}[] }) => void;
    relations: {
        UpperId: number;
        LowerId: number;
        point: number;
    }[] | null;

    changeView: (toggle: boolean) => void;
    selectItem: (id: number) => void;
    setOpenBasket: React.Dispatch<React.SetStateAction<boolean>>;
    totalPrice: { [key: number]: number } | undefined;
    insertRelation_view: (id: number) => void;
    setSelectedItemId: (id: number | null) => void;
    setViewMode: (mode: boolean) => void;
    inputDragItems_edit: (id: number) => void;

}
const LeftComponent: React.FC<Props> = ({ items, dragItems, addCount, removeCount, drag_on, dragedItem, viewRelation, addRelateGood, relations, changeView, selectItem, setOpenBasket, totalPrice, insertRelation_view, setSelectedItemId, setViewMode, inputDragItems_edit }) => {
    const [openId, setOpenId] = useState<number[]>([])
    const [openView, setOpenView] = useState<boolean>(false)
    const itemsList = useRef<HTMLDivElement>(null)
    const [inter, setInter] = useState<NodeJS.Timeout | undefined>(undefined)
    const [tout, setTout] = useState<NodeJS.Timeout | undefined>(undefined)

    const inCrease = (targetId: number, id: number) => {
        setTout(setTimeout(() => {
            setInter(
                setInterval(() => {
                    addCount(targetId, id)
                }, 100))
        }, 500))
    }
    const deCrease = (targetId: number, id: number) => {
        setTout(setTimeout(() => {
            setInter(
                setInterval(() => {
                    removeCount(targetId, id, 'cont')
                }, 100))
        }, 500))
    }
    useEffect(() => {
        const savedScrollPosition = localStorage.getItem('scrollPosition');

        if (itemsList.current && savedScrollPosition) {
            itemsList.current.scrollTo(0, parseInt(savedScrollPosition, 10))
            // localStorage.removeItem('scrollPosition')
        }
    }, [items])

    return (
        <div className='left' ref={itemsList}>
            <div className="items">
                {items && items.filter(item => item.type === 'SET').map(item =>
                    <div key={item.id} className='item'>
                        <div className='title'>{item.itemName}</div>

                        <div className='itemInfo'>
                            <div className="image">
                                {item.Images.length > 0 ? <img src={item.Images[0].url} alt='' width='170px'></img> :
                                    <img src="http://via.placeholder.com/170x190" alt=""></img>}
                            </div>
                            <div className='info'>
                                <div>카테고리: {item.category}</div>
                                <div>출고 가격: ${item.ex_price}</div>
                                <div>합산 가격: {item.unit}{totalPrice && totalPrice[item.id] > 0 ? totalPrice[item.id].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0}</div>
                                <div>설명: {item.descript}</div>
                            </div>
                        </div>
                        <button onClick={() => {
                            // console.log(item.id)
                            if (!openId.includes(item.id)) {
                                setOpenId([item.id])
                                setOpenBasket(true)
                                setSelectedItemId(item.id)

                            } else {
                                setOpenId(openId.filter(ids => ids !== item.id))
                                setOpenBasket(false)
                            }
                            insertRelation_view(item.id)
                        }}>Relations</button>
                        {openId.includes(item.id) && <button onClick={() => {
                            setOpenView(!openView);
                            changeView(!openView)
                            if (openView) {
                                //닫힐때
                                setViewMode(false)

                                //현재 상황 저장
                                addRelateGood({
                                    id: item.id,
                                    dragItems: dragItems.filter(dragItem => dragItem.targetId === item.id),
                                    mode: 'left'
                                })



                            } else {
                                setViewMode(true)
                                inputDragItems_edit(item.id)
                                if (itemsList.current) {
                                    const scrollPosition = itemsList.current.scrollTop;
                                    localStorage.setItem('scrollPosition', scrollPosition.toString())
                                }
                            }
                        }}>view Relation</button>}

                        {dragItems.filter(dragItem => dragItem.targetId === item.id).length > 0 &&
                            <div className='lowerList'>총 {dragItems.filter(dragItem => dragItem.targetId === item.id).length}건의 하위 아이템</div>}

                        <div className={`relation-list ${openId.includes(item.id) ? 'open' : 'close'} item_basket`}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => {
                                if (dragedItem) drag_on(item.id, dragedItem.id)
                                addRelateGood({
                                    id: item.id,
                                    dragItems: dragItems.filter(dragItem => dragItem.targetId === item.id),
                                    mode: 'left'
                                })

                            }}
                        >
                            {dragItems.filter(dragitem => dragitem.targetId === item.id).map((dragitem) =>
                                <div className="countControl" key={dragitem.id.toString()}>
                                    <div className={`itemName ${item.category}`}>
                                        {dragitem.itemName}
                                    </div>
                                    <div className='material-symbols'>
                                        <span className="material-symbols-outlined add" style={{ fontSize: '20px' }}
                                            onClick={() => {
                                                // console.log('dragitem.targetId:', dragitem.targetId, 'dragitem.id:', dragitem.id)
                                                addCount(dragitem.targetId, dragitem.id)
                                            }}
                                            onMouseDown={() => {
                                                if (typeof dragitem.targetId === 'number' && typeof dragitem.id === 'number')
                                                    inCrease(dragitem.targetId, dragitem.id)
                                            }}
                                            onMouseUp={() => {
                                                clearInterval(inter)
                                                clearTimeout(tout)
                                            }}
                                        >
                                            add_circle
                                        </span>
                                        <span>{dragitem.point}</span>
                                        <span className="material-symbols-outlined remove" style={{ fontSize: '20px' }}
                                            onClick={() => { removeCount(dragitem.targetId, dragitem.id, '') }}
                                            onMouseDown={() => {
                                                if (typeof dragitem.targetId === 'number' && typeof dragitem.id === 'number')
                                                    deCrease(dragitem.targetId, dragitem.id)
                                            }}
                                            onMouseUp={() => {
                                                clearInterval(inter)
                                                clearTimeout(tout)
                                            }}
                                        >
                                            do_not_disturb_on
                                        </span>
                                    </div>
                                </div>)}
                        </div>
                        {!openView && openId.includes(item.id) && <button onClick={() => {
                            //현재 상황 저장
                            addRelateGood({
                                id: item.id,
                                dragItems: dragItems.filter(dragItem => dragItem.targetId === item.id),
                                mode: 'left'
                            })
                        }}>저장</button>}
                    </div>)}
            </div>
        </div>
    );
};

export default LeftComponent;