
import React, { useState } from 'react';

type Props = {
    onChange: (e: React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLSelectElement>
        | React.ChangeEvent<HTMLTextAreaElement>) => void;

    input: {
        type: string,
        groupType: string,
        groupName: string,
        category: string,
        itemName: string,
        descript: string,
        unit: string,
        im_price: number;
        ex_price: number;
        use: boolean,
        supplyer: string,
        set: boolean,
        weight: number,
        cbm: number,
        moq: number,
        dragItems: {}[],
        // visible: boolean
    };
    insertImage: (e: any) => void;
    imageList: { url: string }[];
    addItem: (item: {
        type: string,
        groupType: string,
        groupName: string,
        category: string,
        itemName: string,
        descript: string,
        unit: string,
        im_price: number;
        ex_price: number;
        use: boolean,
        supplyer: string,
        set: boolean,
        weight: number,
        cbm: number,
        moq: number,
        imageList: { url: string }[],
        dragItems: {}[],
        // visible: boolean;
    }) => void;
    formClose: () => void;
    excel_onChange: (e: any) => void;
    excel_onSubmit: () => void;
    insertGroupType: () => void;
    insertSupplyer: () => void;
    drag_on: () => void;
    goodType: { category: string, type: string }[];
    supplyers: string[];
    dragItems: { [key: string]: string | number | boolean }[];
    T_dragItems: { [key: string]: string | number | boolean }[];
    file: ArrayBuffer | undefined | string | null;
    excelFile: React.LegacyRef<HTMLInputElement> | undefined
    addCount: (id: number | string | boolean) => void;
    removeCount: (id: number | string | boolean, mode: string) => void;
    setIsBasket: React.Dispatch<React.SetStateAction<boolean>>
    isBasket: boolean;
    totalPrice: number;
}
const InputFormComponent: React.FC<Props> = ({ onChange, input, insertImage, imageList, addItem, formClose,
    excel_onChange, excel_onSubmit, file, excelFile, insertGroupType, goodType, supplyers, insertSupplyer, drag_on, dragItems, T_dragItems, addCount, removeCount, isBasket, setIsBasket, totalPrice
}) => {
    const [inter, setInter] = useState<NodeJS.Timeout | undefined>(undefined)
    const [tout, setTout] = useState<NodeJS.Timeout | undefined>(undefined)
    let sum_im_price = T_dragItems.reduce((acc, curr) => {
        if (typeof curr.sum_im_price === 'number') {
            if (curr.type === 'SET' || curr.type === 'ASSY') {
                acc += totalPrice;
            }
            acc += curr.sum_im_price;
        }
        return acc;
    }, 0)
    const inCrease = (id: number) => {

        setTout(setTimeout(() => {
            setInter(setInterval(() => {
                addCount(id)
            }, 100))
        }, 500))
    }
    const deCrease = (id: number) => {
        setTout(setTimeout(() => {
            setInter(setInterval(() => {
                removeCount(id, 'cont')
            }, 100))
        }, 500))
    }
    return (
        <div className={`form-type ${input.type}`}>
            <div className={`title ${input.type}`}>INPUT</div>
            <form className='input-form' onSubmit={(e) => {
                e.preventDefault();

                addItem({
                    type: input.type,
                    groupType: input.groupType,
                    groupName: input.groupName,
                    category: input.category,
                    itemName: input.itemName,
                    descript: input.descript,
                    unit: input.unit,
                    im_price: input.im_price,
                    ex_price: input.ex_price,
                    use: input.use,
                    supplyer: input.supplyer,
                    weight: input.weight,
                    cbm: input.cbm,
                    moq: input.moq,
                    set: input.set,
                    imageList,
                    dragItems: T_dragItems,
                    // visible: false
                })

            }}>
                <div className={`form-category ${input.category}`}>


                    <div className="selection">
                        <div className='main'>
                            <input type="radio" id="제품_input" name="type" value="SET"
                                checked={input.type === 'SET'}
                                onChange={onChange} />
                            <label htmlFor="제품_input">제품</label>
                            <input type="radio" id="결합물_input" name="type" value="ASSY"
                                checked={input.type === 'ASSY'}
                                onChange={onChange} />
                            <label htmlFor="결합물_input">결합</label>
                            <input type="radio" id="부품물_input" name="type" value="PARTS"
                                checked={input.type === 'PARTS'}
                                onChange={onChange} />
                            <label htmlFor="부품물_input">부품</label>
                        </div>


                        {input.type === 'SET' && <div className={`sub ${input.type}`}>
                            <div className="categories">
                                <input type="radio" id="EDT_input" name="category" value="EDT"
                                    checked={input.category === 'EDT'}
                                    onChange={onChange}
                                />
                                <label htmlFor="EDT_input">EDT</label>
                                <input type="radio" id="NOBARK_input" name="category" value="NOBARK" checked={input.category === "NOBARK"} onChange={onChange} />
                                <label htmlFor="NOBARK_input">NOBARK</label>
                                <input type="radio" id="RDT_input" name="category" value="RDT" checked={input.category === "RDT"} onChange={onChange} />
                                <label htmlFor="RDT_input">RDT</label>
                                <br />
                                <input type="radio" id="LAUNCHER_input" name="category" value="LAUNCHER" checked={input.category === "LAUNCHER"} onChange={onChange} />
                                <label htmlFor="LAUNCHER_input">LAUNCHER</label>
                                <input type="radio" id="기타물_input" name="category" value="기타" checked={input.category === "기타"} onChange={onChange} />
                                <label htmlFor="기타물_input">기타</label>
                                <br />
                            </div>


                            <div className="input_text">
                                <select value={input.groupType} name="groupType" onChange={onChange}  >
                                    <option value="">제품군 선택</option>
                                    {goodType.filter(type => type.category === input.category).map(type => (
                                        <option value={type.type} key={type.type} >{type.type}</option>
                                    ))}
                                    <option value="New">새로운 제품군</option>
                                </select>
                                {input.groupType === 'New' && (<div className="insert_type"><input type="text" name="new_groupType" id="" placeholder='새로운 제품군 입력'
                                    onChange={onChange} /><button onClick={() => { insertGroupType() }}>+</button></div>)}

                                <input type="text" name="groupName" value={input.groupName} onChange={onChange} placeholder='DT 품명 입력' onFocus={e => e.target.select()} />
                                <input type="text" name="itemName" value={input.itemName} onChange={onChange} placeholder='은기 품명 입력' onFocus={e => e.target.select()} />
                                <textarea name="descript" value={input.descript} onChange={onChange} placeholder='설명 입력' onFocus={e => e.target.select()}>{input.descript}</textarea>
                            </div>
                            <button type="button" onClick={() => setIsBasket(!isBasket)} >연결창 열기</button>

                            {isBasket && <div>
                                {dragItems.length > 0 && <div className='lowerList'>총 {dragItems.length}건의 하위 아이템</div>}
                                <div className="item_basket"
                                    onDragEnter={drag_on}
                                >
                                    {T_dragItems && T_dragItems.map((item) =>
                                        <div className="countControl" key={item.id.toString()}>
                                            <div className={`itemName ${item.type} ${item.category}`}>
                                                {item.itemName}
                                            </div>
                                            <div className='material-symbols'>
                                                <span className="material-symbols-outlined add" style={{ fontSize: '20px' }}
                                                    onClick={() => { addCount(item.id) }}
                                                    onMouseDown={() => {
                                                        if (typeof item.id === 'number')
                                                            inCrease(item.id)
                                                    }}
                                                    onMouseUp={() => {
                                                        clearInterval(inter)
                                                        clearTimeout(tout)
                                                    }}
                                                >
                                                    add_circle
                                                </span>
                                                <span>{item.point}</span>
                                                <span className="material-symbols-outlined remove" style={{ fontSize: '20px' }}
                                                    onClick={() => { removeCount(item.id, '') }}
                                                    onMouseDown={() => {
                                                        if (typeof item.id === 'number')
                                                            inCrease(item.id)
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
                            </div>}


                            <div className="currency">
                                <div className="ex_price">
                                    <label htmlFor="ex_price">Price</label>
                                    <label htmlFor="$_input">$</label>
                                    <input type="text" name="ex_price" id="ex_price" value={input.ex_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChange={onChange} min={0} placeholder='출고단가 입력' onFocus={e => e.target.select()} style={{ textAlign: 'right' }} />
                                </div>
                                <div className="sets">
                                    <div className="input">
                                        <label htmlFor="set">SET</label>
                                        <input type="radio" name="set" id="set" value="1" onChange={onChange} defaultChecked={input.set} />
                                        <label htmlFor="ea">EA</label>
                                        <input type="radio" name="set" id="ea" value="0" onChange={onChange} />
                                    </div>
                                </div>
                            </div>


                            <div className="packingInfo">
                                <label htmlFor="weight">weight</label>
                                <input type="text" name="weight" id="weight" onChange={onChange} />


                                <label htmlFor="cbm">cbm</label>
                                <input type="text" name="cbm" id="cbm" onChange={onChange} />


                                <label htmlFor="moq">moq</label>
                                <input type="text" name="moq" id="moq" onChange={onChange} />

                            </div>

                            <div className="uses">

                                <select name="supplyer" id="supplyer" onChange={onChange}>
                                    <option value="자체">자체</option>
                                    <option value="유성엔지니어링">유성엔지니어링</option>
                                </select>
                                <input id='use' type="radio" name="use" value={1} onChange={onChange} checked={input.use === true} />
                                <label htmlFor="use">사용</label>
                                <input id='no-use' type="radio" name="use" value={0} onChange={onChange} checked={input.use === false} />
                                <label htmlFor="no-use">미사용</label>
                            </div>

                        </div>}
                        {input.type === 'ASSY' && <div className={`sub ${input.type}`}>
                            <div className="categories">
                                <input type="radio" id="회로물_input" name="category" value="회로" checked={input.category === '회로'} onChange={onChange}
                                />
                                <label htmlFor="회로물_input">회로</label>
                                <input type="radio" id="전장물_input" name="category" value="전장" checked={input.category === "전장"} onChange={onChange} />
                                <label htmlFor="전장물_input">전장</label>
                                <input type="radio" id="기구물_input" name="category" value="기구" checked={input.category === "기구"} onChange={onChange} />
                                <label htmlFor="기구물_input">기구</label>
                                <input type="radio" id="포장물_input" name="category" value="포장" checked={input.category === "포장"} onChange={onChange} />
                                <label htmlFor="포장물_input">포장</label>
                                <input type="radio" id="기타물_input" name="category" value="기타" checked={input.category === "기타"} onChange={onChange} />
                                <label htmlFor="기타물_input">기타</label>
                            </div>

                            <div className="input_text">

                                <input type="text" name="itemName" value={input.itemName} onChange={onChange} placeholder='결합물 이름 입력' onFocus={e => e.target.select()} />
                                <div>
                                    <textarea name="descript" value={input.descript} onChange={onChange} placeholder='결합물 설명 입력' onFocus={e => e.target.select()}>{input.descript}</textarea>
                                </div>
                            </div>
                            {dragItems.length > 0 && <div className='lowerList'>총 {dragItems.length}건의 하위 아이템</div>}
                            <div className="item_basket"
                                onDragEnter={drag_on}
                            >
                                {T_dragItems && T_dragItems.map((item) =>

                                    <div className="countControl" key={item.id.toString()}>
                                        <div className={`itemName ${item.type} ${item.category}`}>

                                            {item.itemName}
                                        </div>

                                        <div className='material-symbols'>

                                            <span className="material-symbols-outlined add" style={{ fontSize: '20px' }}
                                                onClick={() => {

                                                    addCount(item.id)
                                                }}
                                                onMouseDown={() => {
                                                    if (typeof item.id === 'number')
                                                        inCrease(item.id)
                                                }}
                                                onMouseUp={() => {
                                                    clearInterval(inter)
                                                    clearTimeout(tout)
                                                }}
                                            >
                                                add_circle
                                            </span>
                                            <span>{item.point}</span>
                                            <span className="material-symbols-outlined remove" style={{ fontSize: '20px' }}
                                                onClick={() => { removeCount(item.id, '') }}
                                                onMouseDown={() => {
                                                    if (typeof item.id === 'number')
                                                        deCrease(item.id,)
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
                                    <div className="im_price">
                                        <label htmlFor="￦_input">입고가격</label>
                                        <label htmlFor="￦_input">￦</label>
                                        <input type="text" name="im_price" value={input.im_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                            onChange={onChange}
                                            min={0}
                                            // placeholder='입고단가 입력'
                                            // onFocus={e => e.target.select()} 
                                            style={{ textAlign: 'right' }} />
                                    </div>
                                    <div className="im_price">
                                        <label htmlFor="￦_input">입고합계</label>
                                        <label htmlFor="￦_input">￦</label>
                                        <input type="text" name="im_price" readOnly value={(sum_im_price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                            onChange={onChange}
                                            min={0}
                                            // placeholder='입고단가 입력'
                                            // onFocus={e => e.target.select()} 
                                            style={{ textAlign: 'right' }} />
                                    </div>
                                </div>

                                <div className="ex_price">
                                    <label htmlFor="$_input">출고가격</label>
                                    <label htmlFor="$_input">$</label>
                                    <input type="text" name="ex_price" value={input.ex_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChange={onChange} min={0}
                                        // placeholder='출고단가 입력'
                                        // onFocus={e => e.target.select()} 
                                        style={{ textAlign: 'right' }} />
                                </div>

                            </div>
                            {<div className="supplyer">
                                <label htmlFor="supplyer">공급자</label>
                                <select value={input.supplyer} name="supplyer" id="supplyer" onChange={onChange}>
                                    <option value="">공급자 선택</option>
                                    {supplyers &&
                                        supplyers.map(supplyer => (
                                            <option key={supplyer} value={supplyer} >{supplyer}</option>))}
                                    <option value="New">신규 업체</option>
                                </select>

                                {input.supplyer === 'New' && (<div className="insert_supplyer"><input type="text" name="new_supplyer" id="" placeholder='새로운 공급자 입력'
                                    onChange={onChange} /><button onClick={() => { insertSupplyer() }}>+</button></div>)}
                            </div>}


                        </div>}
                        {input.type === 'PARTS' && <div className={`sub ${input.type}`}>
                            <div className="categories">
                                <input type="radio" id="회로물_input" name="category" value="회로" checked={input.category === '회로'} onChange={onChange}
                                />
                                <label htmlFor="회로물_input">회로</label>
                                <input type="radio" id="전장물_input" name="category" value="전장" checked={input.category === "전장"} onChange={onChange} />
                                <label htmlFor="전장물_input">전장</label>
                                <input type="radio" id="기구물_input" name="category" value="기구" checked={input.category === "기구"} onChange={onChange} />
                                <label htmlFor="기구물_input">기구</label>
                                <input type="radio" id="포장물_input" name="category" value="포장" checked={input.category === "포장"} onChange={onChange} />
                                <label htmlFor="포장물_input">포장</label>
                                <input type="radio" id="기타물_input" name="category" value="기타" checked={input.category === "기타"} onChange={onChange} />
                                <label htmlFor="기타물_input">기타</label>
                            </div>

                            <div className="input_text">
                                <input type="text" name="itemName" value={input.itemName} onChange={onChange} placeholder='이름 입력' onFocus={e => e.target.select()} />
                                <div>
                                    <textarea name="descript" value={input.descript} onChange={onChange} placeholder='설명 입력' onFocus={e => e.target.select()}>{input.descript}</textarea>
                                </div>
                            </div>
                            {/* <input type="number" name="count" value={input.count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChange={onChange} min={0} placeholder='수량 입력' onFocus={e => e.target.select()} /> */}
                            <div className="currency">

                                <div className="im_price">
                                    <label htmlFor="im_price">입고 가격</label>
                                    <input type="radio" id="￦_input" value="\\" name="unit" checked={input.unit === "\\"} onChange={onChange} />
                                    <label htmlFor="￦_input">￦</label>
                                    <input type="radio" id="$_input" value="$" name="unit" checked={input.unit === "$"} onChange={onChange} />
                                    <label htmlFor="$_input">$</label>
                                    <input type="radio" id="￥_input" value="￥" name="unit" checked={input.unit === "￥"} onChange={onChange} />
                                    <label htmlFor="￥_input">￥</label>
                                    <input type="text" name="im_price" id="im_price" value={input.im_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChange={onChange} placeholder='입고단가 입력' onFocus={e => e.target.select()} style={{ textAlign: 'right' }} />
                                </div>
                                <div className='uses_price_combine'>

                                    <div className="ex_price">
                                        <label htmlFor="ex_price">출고 가격</label>
                                        <label htmlFor="$_input">$</label>
                                        <input type="text" name="ex_price" id="ex_price" value={input.ex_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChange={onChange} placeholder='출고단가 입력' onFocus={e => e.target.select()} style={{ textAlign: 'right' }} />
                                    </div>

                                    <div className="uses">
                                        <input id='use' type="radio" name="use" value={1} onChange={onChange} checked={input.use === true} />
                                        <label htmlFor="use">사용</label>
                                        <input id='no-use' type="radio" name="use" value={0} onChange={onChange} checked={input.use === false} />
                                        <label htmlFor="no-use">미사용</label>
                                    </div>
                                </div>
                            </div>
                            {<div className="supplyer">
                                <label htmlFor="supplyer">공급자</label>
                                <select value={input.supplyer} name="supplyer" id="supplyer" onChange={onChange}>
                                    <option value="">공급자 선택</option>
                                    {supplyers.length > 0 &&
                                        supplyers.map(supplyer => (
                                            <option key={supplyer} value={supplyer} >{supplyer}</option>))}
                                    <option value="New">신규 업체</option>
                                </select>

                                {input.supplyer === 'New' && (<div className="insert_supplyer"><input type="text" name="new_supplyer" id="" placeholder='새로운 공급자 입력'
                                    onChange={onChange} /><button onClick={() => { insertSupplyer() }}>+</button></div>)}
                            </div>}
                        </div>}
                    </div>

                    <div className='file'>
                        <label htmlFor="file_input">그림 선택</label>
                        <input type="file" id="file_input" name="images" onChange={insertImage} multiple accept='image/*' />
                    </div>

                    <div className={`imageList imageList?"open":""`}>
                        {imageList.map((image, index) => <div key={index} className='image'><img src={image.url} width='90px' alt={image.url} /></div>)}
                    </div>

                    <div className="input-submit">

                        <label htmlFor="excel"><img src="/images/excel_btn.png" alt=''  ></img></label>
                        <input type="file" id='excel' onChange={excel_onChange} ref={excelFile}></input>
                        {file ? <button type='button' onClick={excel_onSubmit}>엑셀등록</button> : <button type='submit'>등록</button>}

                        <button className='close' onClick={formClose}>닫기</button>
                    </div>
                </div >
            </form >
        </div >
    );
};

export default InputFormComponent;