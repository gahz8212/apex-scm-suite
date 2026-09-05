import React, { useEffect, useState } from 'react';
type Props = {
    prev: {
        [key: string]: string | number | boolean | { groupName: string } | { url: string }[],
        id: number,
        type: string,
        groupType: string,
        category: string,
        itemName: string,
        descript: string,
        unit: string,
        im_price: number;
        sum_im_price: number;
        ex_price: number;
        use: boolean,
        supplyer: string,
        set: boolean,
        weight: number,
        cbm: number,
        moq: number,
        Good: { groupName: string },
        Images: { url: string }[],
        point: number,
    };
    next: {
        [key: string]: string | number | boolean | { groupName: string } | { url: string }[],
        id: number,
        type: string,
        groupType: string,
        category: string,
        itemName: string,
        descript: string,
        unit: string,
        im_price: number;
        sum_im_price: number;
        ex_price: number;
        use: boolean,
        supplyer: string,
        set: boolean,
        weight: number,
        cbm: number,
        moq: number,
        Good: { groupName: string },
        Images: { url: string }[],
        point: number,
        upperId: number,


    };
    // images: { url: string }[]
    onChange: (e: any) => void;
    editImage: (e: any) => void;
    editItem: (item: {
        [key: string]: '' | number | string | { url: string }[] | boolean | {}[]
    }) => void;
    removeItem: (id: number) => void;
    removeImage: (id: number, url: string) => void;
    closeForm: () => void;
    goodType: { category: string, type: string }[];
    supplyers: string[];
    insertGroupType: () => void
    insertSupplyer: () => void
    dragItems: { [key: string]: string | number | boolean }[] | null;
    addCount: (targetId: number | string | boolean, itemId: number | string | boolean) => void;
    removeCount: (targetId: number | string | boolean, itemId: number | string | boolean,mode:string) => void;
    drag_on: (targetId: number, itemId: number) => void;
    dragedItem: { id: number } | null;
    relations: { UpperId: number, LowerId: number, point: number }[] | null;

    totalPrice: number;
    viewMode: boolean;
    drag_on_relation: (targetId: number, itemId: number) => void
    // dragItem: (id: number) => void;
    // onDrop: () => void;
}
const EditFormComponent: React.FC<Props> = ({ prev, next, onChange, editImage, editItem, removeItem, removeImage, closeForm, goodType, supplyers,
    insertGroupType, insertSupplyer, dragItems, addCount, removeCount, drag_on, drag_on_relation, dragedItem, relations, totalPrice, viewMode }) => {
    // const [openViewer, setOpenViewer] = useState<boolean>(true);
    const [inter, setInter] = useState<NodeJS.Timeout | undefined>(undefined)
    const [tout, setTout] = useState<NodeJS.Timeout | undefined>(undefined)
    const inCrease = (targetId: number, id: number) => {
        setTout(setTimeout(() => {
            setInter(setInterval(() => {
                addCount(targetId, id)
            }, 100))
        }, 500))
    }
    const deCrease = (targetId: number, id: number) => {
        setTout(setTimeout(() => {
            setInter(setInterval(() => {
          removeCount(targetId, id,'cont')
            }, 100))
        }, 500))
    }
    return (
        <div className={`form-type`}>
            <div className={`title  ${next.type}`}>EDIT</div>
            <form className='edit-form' onSubmit={(e) => {

                e.preventDefault();
                const changedProps: {
                    [key: string]: '' | number | string | boolean | { groupName: string } | { url: string }[],

                } = {};
                const keys = Object.keys(next);
                for (let key of keys) {
                    if (prev[key] !== next[key]) {
                        changedProps[key] = next[key]
                    }
                }
                if (dragItems) {
                    const newItem = ({ id: next.id, ...changedProps, dragItems, mode: 'rest' })
                    // Object.keys(changedProps)
                    // console.log('newItem', newItem)
                    editItem(newItem)
                }
            }
            }
            >
                <div className={`form-category ${next.category}`}>

                    <div className="selection">
                        <div className='main'>
                            <input type="radio" id="제품_edit" name="type" value="SET"
                                checked={next.type === 'SET'}
                                onChange={onChange} />
                            <label htmlFor="제품_edit">제품</label>
                            <input type="radio" id="결합물_edit" name="type" value="ASSY"
                                checked={next.type === 'ASSY'}
                                onChange={onChange} />
                            <label htmlFor="결합물_edit">결합</label>
                            <input type="radio" id="부품물_edit" name="type" value="PARTS"
                                checked={next.type === 'PARTS'}
                                onChange={onChange} />
                            <label htmlFor="부품물_edit">부품</label>
                        </div>
                        {next.type === 'SET' && <div className={`sub ${next.type}`}>
                            <div className="categories">
                                <input type="radio" id="EDT_edit" name="category" value="EDT"
                                    checked={next.category === 'EDT'}
                                    onChange={onChange}
                                />
                                <label htmlFor="EDT_edit">EDT</label>
                                <input type="radio" id="NOBARK_edit" name="category" value="NOBARK" checked={next.category === "NOBARK"} onChange={onChange} />
                                <label htmlFor="NOBARK_edit">NOBARK</label>
                                <input type="radio" id="RDT_edit" name="category" value="RDT" checked={next.category === "RDT"} onChange={onChange} />
                                <label htmlFor="RDT_edit">RDT</label>
                                <br />
                                <input type="radio" id="LAUNCHER_edit" name="category" value="LAUNCHER" checked={next.category === "LAUNCHER"} onChange={onChange} />
                                <label htmlFor="LAUNCHER_edit">LAUNCHER</label>
                                <input type="radio" id="기타물_edit" name="category" value="기타" checked={next.category === "기타"} onChange={onChange} />
                                <label htmlFor="기타물_edit">기타</label>
                                <br />
                            </div>
                            <div className="input_text">
                                <select value={next.groupType} name="groupType" onChange={onChange}  >
                                    <option value="">제품군 선택</option>
                                    {goodType.filter(type => type.category === next.category).map(type => (
                                        <option value={type.type} key={type.type} >{type.type}</option>
                                    ))}
                                    <option value="New">새로운 제품군</option>
                                </select>
                                {next.groupType === 'New' && (<div className="insert_type"><input type="text" name="new_groupType" id="" placeholder='새로운 제품군 입력'
                                    onChange={onChange} /><button onClick={() => { insertGroupType() }}>+</button></div>)}

                                {next.Good ?
                                    <input type="text" name="groupName" value={next.Good.groupName} onChange={onChange} placeholder='DT 품명 입력' onFocus={e => e.target.select()} /> :
                                    <input type="text" name="groupName" onChange={onChange} placeholder='DT 품명 입력' onFocus={e => e.target.select()} />}
                                <input type="text" name="itemName" value={next.itemName} onChange={onChange} placeholder='은기 품명 입력' onFocus={e => e.target.select()} />
                                <textarea name="descript" value={next.descript} onChange={onChange} placeholder='설명 입력' onFocus={e => e.target.select()}>{next.descript}</textarea>
                            </div>

                            <div className="item_basket" onDragEnter={() => {
                                if (dragedItem) drag_on(next.id, dragedItem.id)
                            }}>
                                {dragItems && dragItems.map((dragitem) =>
                                    <div className="countControl" key={dragitem.id.toString()}>
                                        <div className={`itemName ${dragitem.type} ${dragitem.category}`}>
                                            {dragitem.itemName}
                                        </div>
                                        <div className='material-symbols'>
                                            <span className="material-symbols-outlined add" style={{ fontSize: '20px' }}
                                                onClick={() => {
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
                                                onClick={() => { removeCount(dragitem.targetId, dragitem.id,'') }}
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
                            <div className="currency">
                                <div>

                                    <div className="ex_price">
                                        <label htmlFor="ex_price">수출가</label>
                                        <label htmlFor="$_edit">$ </label>
                                        <input type="text" name="ex_price" id="ex_price" value={next.ex_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChange={onChange} min={0} placeholder='출고단가 입력' onFocus={e => e.target.select()} style={{ textAlign: 'right' }} />
                                    </div>
                                    <div className="ex_price">
                                        <label htmlFor="ex_price">입고합산</label>
                                        <label htmlFor="$_edit">\</label>
                                        <input type="text" name="ex_price" id="ex_price" value={totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChange={onChange} min={0} placeholder='출고단가 입력' onFocus={e => e.target.select()} style={{ textAlign: 'right' }} />
                                    </div>
                                </div>
                                <div className="sets">
                                    <div className="input">
                                        <label htmlFor="set">SET</label>
                                        <input type="radio" name="set" id="set" value="1" onChange={onChange} checked={next.sets === "SET"} />
                                        <label htmlFor="ea">EA</label>
                                        <input type="radio" name="set" id="ea" value="0" onChange={onChange} checked={next.sets === "EA"} />
                                    </div>
                                </div>
                            </div>
                            <div className="packingInfo">
                                <label htmlFor="weight">weight</label>
                                <input type="text" name="weight" id="weight" onChange={onChange} value={next.weight} />
                                <label htmlFor="cbm">cbm</label>
                                <input type="text" name="cbm" id="cbm" onChange={onChange} value={next.cbm} />
                                <label htmlFor="moq">moq</label>
                                <input type="text" name="moq" id="moq" onChange={onChange} value={next.moq} />
                            </div>
                            <div className="uses">
                                <select name="supplyer" id="supplyer" onChange={onChange}>
                                    <option value="자체">자체</option>
                                    <option value="유성엔지니어링">유성엔지니어링</option>
                                </select>
                                <input id='use' type="radio" name="use" value={1} onChange={onChange} checked={next.use === true} />
                                <label htmlFor="use">사용</label>
                                <input id='no-use' type="radio" name="use" value={0} onChange={onChange} checked={next.use === false} />
                                <label htmlFor="no-use">미사용</label>
                            </div>
                        </div>}


                        {next.type === 'ASSY' && <div className={`sub ${next.type}`}>
                            <div className="categories">
                                <input type="radio" id="회로물_edit" name="category" value="회로" checked={next.category === '회로'} onChange={onChange} />
                                <label htmlFor="회로물_edit">회로</label>
                                <input type="radio" id="전장물_edit" name="category" value="전장" checked={next.category === "전장"} onChange={onChange} />
                                <label htmlFor="전장물_edit">전장</label>
                                <input type="radio" id="기구물_edit" name="category" value="기구" checked={next.category === "기구"} onChange={onChange} />
                                <label htmlFor="기구물_edit">기구</label>
                                <input type="radio" id="포장물_edit" name="category" value="포장" checked={next.category === "포장"} onChange={onChange} />
                                <label htmlFor="포장물_edit">포장</label>
                                <input type="radio" id="기타물_edit" name="category" value="기타" checked={next.category === "기타"} onChange={onChange} />
                                <label htmlFor="기타물_edit">기타</label>
                            </div>

                            <div className="input_text">

                                <input type="text" name="itemName" value={next.itemName} onChange={onChange} placeholder='결합물 이름 입력' onFocus={e => e.target.select()} />
                                <div>
                                    <textarea name="descript" value={next.descript} onChange={onChange} placeholder='결합물 설명 입력' onFocus={e => e.target.select()}>{next.descript}</textarea>
                                </div>
                            </div>

                            <div className="item_basket"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => {
                                    // if (dragedItem) drag_on(next.id, dragedItem.id)
                                    if (viewMode) {
                                        // if (dragedItem) drag_on_relation(next.id, dragedItem.id)
                                        alert('구현 준비 중 입니다.')
                                    } else {
                                        if (dragedItem) drag_on(next.id, dragedItem.id)
                                    }
                                }}>
                                {dragItems && dragItems.map((dragitem) => {
                                    // console.log('dragitem', dragitem)
                                    return <div className="countControl" key={dragitem.id.toString()}>
                                        <div className={`itemName ${dragitem.type} ${dragitem.category}`}>
                                            {dragitem.itemName}
                                        </div>
                                        <div className='material-symbols'>
                                            <span className="material-symbols-outlined add" style={{ fontSize: '20px' }}
                                                onClick={() => {
                                                    addCount(dragitem.targetId, dragitem.id)
                                                }}
                                                onMouseDown={() => {
                                                    if (typeof dragitem.targetId === 'number' && typeof dragitem.id === 'number') {
                                                        inCrease(dragitem.targetId, dragitem.id)
                                                    }
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
                                                onClick={() => { removeCount(dragitem.targetId, dragitem.id,'') }}
                                                onMouseDown={() => {

                                                    if (typeof dragitem.targetId === 'number' && typeof dragitem.id === 'number') {
                                                        deCrease(dragitem.targetId, dragitem.id)
                                                    }
                                                }}
                                                onMouseUp={() => {
                                                    clearInterval(inter)
                                                    clearTimeout(tout)
                                                }}
                                            >
                                                do_not_disturb_on
                                            </span>
                                        </div>
                                    </div>
                                })}
                            </div>
                            <div className="currency">
                                <div className="im_price">
                                    <div>

                                        <label htmlFor="￦_edit">입고가격</label>
                                        <label htmlFor="￦_edit">￦</label>
                                        {<input type="text" name="im_price" value={next.im_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChange={onChange} min={0} placeholder='입고단가 입력' onFocus={e => e.target.select()} style={{ textAlign: 'right' }} />}
                                    </div>
                                    <div>

                                        <label htmlFor="￦_edit">합산가격</label>
                                        <label htmlFor="￦_edit">￦</label>
                                        {<input type="text" name="sum_im_price" value={totalPrice?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChange={onChange} min={0} placeholder='입고단가 입력' onFocus={e => e.target.select()} style={{ textAlign: 'right' }} />}

                                    </div>

                                </div>

                                <div className="ex_price">
                                    <label htmlFor="$_edit">출고가격</label>
                                    <label htmlFor="$_edit">$</label>
                                    <input type="text" name="ex_price" value={next.ex_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChange={onChange} min={0} placeholder='출고단가 입력' onFocus={e => e.target.select()} style={{ textAlign: 'right' }} />
                                </div>

                            </div>
                            {<div className="supplyer">
                                <label htmlFor="supplyer">공급자</label>
                                <select value={next.supplyer} name="supplyer" id="supplyer" onChange={onChange}>
                                    {next.supplyer ? <option value="">{next.supplyer}</option> : <option value="">공급자 입력</option>}
                                    {supplyers &&
                                        supplyers.map(supplyer => (
                                            <option key={supplyer} value={supplyer} >{supplyer}</option>))}
                                    <option value="New">신규 업체</option>
                                </select>

                                {next.supplyer === 'New' && (<div className="insert_supplyer"><input type="text" name="new_supplyer" id="" placeholder='새로운 공급자 입력'
                                    onChange={onChange} /><button onClick={() => { insertSupplyer() }}>+</button></div>)}
                            </div>}


                        </div>}




                        {next.type === 'PARTS' && <div className={`sub ${next.type}`}>
                            <div className="categories">
                                <input type="radio" id="회로물_edit" name="category" value="회로" checked={next.category === '회로'} onChange={onChange}
                                />
                                <label htmlFor="회로물_edit">회로</label>
                                <input type="radio" id="전장물_edit" name="category" value="전장" checked={next.category === "전장"} onChange={onChange} />
                                <label htmlFor="전장물_edit">전장</label>
                                <input type="radio" id="기구물_edit" name="category" value="기구" checked={next.category === "기구"} onChange={onChange} />
                                <label htmlFor="기구물_edit">기구</label>
                                <input type="radio" id="포장물_edit" name="category" value="포장" checked={next.category === "포장"} onChange={onChange} />
                                <label htmlFor="포장물_edit">포장</label>
                                <input type="radio" id="기타물_edit" name="category" value="기타" checked={next.category === "기타"} onChange={onChange} />
                                <label htmlFor="기타물_edit">기타</label>
                            </div>

                            <div className="input_text">
                                <input type="text" name="itemName" value={next.itemName} onChange={onChange} placeholder='이름 입력' onFocus={e => e.target.select()} />
                                <div>
                                    <textarea name="descript" value={next.descript} onChange={onChange} placeholder='설명 입력' onFocus={e => e.target.select()}>{next.descript}</textarea>
                                </div>
                            </div>
                            {/* <input type="number" name="count" value={input.count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChange={onChange} min={0} placeholder='수량 입력' onFocus={e => e.target.select()} /> */}
                            <div className="currency">

                                <div className="im_price">
                                    <label htmlFor="im_price">입고 가격</label>
                                    <input type="radio" id="￦_edit" value="\\" name="unit" checked={next.unit === "\\"} onChange={onChange} />
                                    <label htmlFor="￦_edit">￦</label>
                                    <input type="radio" id="$_edit" value="$" name="unit" checked={next.unit === "$"} onChange={onChange} />
                                    <label htmlFor="$_edit">$</label>
                                    <input type="radio" id="￥_edit" value="￥" name="unit" checked={next.unit === "￥"} onChange={onChange} />
                                    <label htmlFor="￥_edit">￥</label>
                                    <input type="text" name="im_price" id="im_price" value={next.im_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChange={onChange} placeholder='입고단가 입력' onFocus={e => e.target.select()} style={{ textAlign: 'right' }} />
                                </div>
                                <div className='uses_price_combine'>

                                    <div className="ex_price">
                                        <label htmlFor="ex_price">출고 가격</label>
                                        <label htmlFor="$_edit">$</label>
                                        <input type="text" name="ex_price" id="ex_price" value={next.ex_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChange={onChange} placeholder='출고단가 입력' onFocus={e => e.target.select()} style={{ textAlign: 'right' }} />
                                    </div>

                                    <div className="uses">
                                        <input id='use' type="radio" name="use" value={1} onChange={onChange} checked={next.use === true} />
                                        <label htmlFor="use">사용</label>
                                        <input id='no-use' type="radio" name="use" value={0} onChange={onChange} checked={next.use === false} />
                                        <label htmlFor="no-use">미사용</label>
                                    </div>
                                </div>
                            </div>
                            {<div className="supplyer">
                                <label htmlFor="supplyer">공급자</label>
                                <select value={next.supplyer} name="supplyer" id="supplyer" onChange={onChange}>
                                    {next.supplyer ? <option value="">{next.supplyer}</option> : <option value="">공급자 입력</option>}
                                    {supplyers &&
                                        supplyers.map(supplyer => (
                                            <option key={supplyer} value={supplyer} >{supplyer}</option>))}
                                    <option value="New">신규 업체</option>
                                </select>

                                {next.supplyer === 'New' && (<div className="insert_supplyer"><input type="text" name="new_supplyer" id="" placeholder='새로운 공급자 입력'
                                    onChange={onChange} /><button onClick={() => { insertSupplyer() }}>+</button></div>)}
                            </div>}
                        </div>}
                    </div>

                    <div className='file'>
                        <label htmlFor="file_edit">그림 추가</label>
                        <input type="file" id="file_edit" name="images" onChange={editImage} multiple accept='image/*' />
                    </div>
                    <div className="imageList">
                        {next.Images.map((image, index) => <div key={index} className='image' onDoubleClick={() => { removeImage(next.id, image.url) }}><img src={image.url} width='90px' alt={image.url} /></div>)}
                    </div>

                    <div className="input-submit_edit">

                        <button type='submit'>수정</button>
                        <button type='button' onClick={() => { removeItem(next.id) }}>삭제</button>
                        <button type='button' onClick={closeForm}>닫기</button>
                    </div>
                </div>

            </form>
        </div>
    );
};

export default EditFormComponent;