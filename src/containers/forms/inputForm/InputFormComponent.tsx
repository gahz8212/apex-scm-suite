import React, { useState } from 'react';
import { formatCurrencySymbol } from '../../../lib/utils/formatCurrency';

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
        new_groupType?: string,
        new_supplyer?: string,
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
    excelFile: React.LegacyRef<HTMLInputElement> | undefined;
    addCount: (id: number | string | boolean) => void;
    removeCount: (id: number | string | boolean, mode: string) => void;
    setIsBasket: React.Dispatch<React.SetStateAction<boolean>>;
    isBasket: boolean;
    totalPrice: number;
};

const InputFormComponent: React.FC<Props> = ({
    onChange, input, insertImage, imageList, addItem, formClose,
    excel_onChange, excel_onSubmit, file, excelFile, insertGroupType,
    goodType, supplyers, insertSupplyer, drag_on, dragItems, T_dragItems,
    addCount, removeCount, isBasket, setIsBasket, totalPrice
}) => {
    const [inter, setInter] = useState<NodeJS.Timeout | undefined>(undefined);
    const [tout, setTout] = useState<NodeJS.Timeout | undefined>(undefined);

    const sum_im_price = T_dragItems.reduce((acc, curr) => {
        if (typeof curr.sum_im_price === 'number') {
            if (curr.type === 'SET' || curr.type === 'ASSY') {
                acc += totalPrice;
            }
            acc += curr.sum_im_price;
        }
        return acc;
    }, 0);

    const inCrease = (id: number) => {
        setTout(setTimeout(() => {
            setInter(setInterval(() => {
                addCount(id);
            }, 100));
        }, 500));
    };

    const deCrease = (id: number) => {
        setTout(setTimeout(() => {
            setInter(setInterval(() => {
                removeCount(id, 'cont');
            }, 100));
        }, 500));
    };

    const setCategories = ['EDT', 'NOBARK', 'RDT', 'LAUNCHER', '기타'];
    const partsCategories = ['회로', '전장', '기구', '포장', '기타'];

    const typeBadgeText: { [key: string]: string } = {
        SET: '제품 (SET)',
        ASSY: '결합 (ASSY)',
        PARTS: '부품 (PARTS)'
    };

    return (
        <div className={`form-type ${input.type}`}>
            {/* 1. Header */}
            <div className={`title ${input.type}`}>
                <div className="title-left">
                    <span className="mode-badge">INPUT</span>
                    <span className="type-badge">{typeBadgeText[input.type] || input.type}</span>
                </div>
                <button type="button" className="title-close-btn" onClick={formClose} title="닫기">
                    ✕
                </button>
            </div>

            <form className="input-form" onSubmit={(e) => {
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
                });
            }}>
                <div className={`form-category ${input.category}`}>
                    {/* 2. Type Segmented Control */}
                    <div className="type-segment-control">
                        <div className="segment-item">
                            <input
                                type="radio"
                                id="type_SET_input"
                                name="type"
                                value="SET"
                                checked={input.type === 'SET'}
                                onChange={onChange}
                            />
                            <label htmlFor="type_SET_input">제품 (SET)</label>
                        </div>
                        <div className="segment-item">
                            <input
                                type="radio"
                                id="type_ASSY_input"
                                name="type"
                                value="ASSY"
                                checked={input.type === 'ASSY'}
                                onChange={onChange}
                            />
                            <label htmlFor="type_ASSY_input">결합 (ASSY)</label>
                        </div>
                        <div className="segment-item">
                            <input
                                type="radio"
                                id="type_PARTS_input"
                                name="type"
                                value="PARTS"
                                checked={input.type === 'PARTS'}
                                onChange={onChange}
                            />
                            <label htmlFor="type_PARTS_input">부품 (PARTS)</label>
                        </div>
                    </div>

                    {/* 3. Category Chips */}
                    <div className="category-chips">
                        {(input.type === 'SET' ? setCategories : partsCategories).map((cat) => (
                            <div className="chip-item" key={cat}>
                                <input
                                    type="radio"
                                    id={`cat_${cat}_input`}
                                    name="category"
                                    value={cat}
                                    checked={input.category === cat}
                                    onChange={onChange}
                                />
                                <label htmlFor={`cat_${cat}_input`} className={`chip-${cat}`}>
                                    {cat}
                                </label>
                            </div>
                        ))}
                    </div>

                    {/* 4. Basic Information */}
                    {input.type === 'SET' && (
                        <>
                            <div className="form-group">
                                <label htmlFor="groupType_input">제품군 (Group Type)</label>
                                <select
                                    id="groupType_input"
                                    value={input.groupType}
                                    name="groupType"
                                    onChange={onChange}
                                >
                                    <option value="">제품군 선택</option>
                                    {goodType.filter(type => type.category === input.category).map(type => (
                                        <option value={type.type} key={type.type}>{type.type}</option>
                                    ))}
                                    <option value="New">➕ 새로운 제품군 추가</option>
                                </select>
                                {input.groupType === 'New' && (
                                    <div className="inline-add">
                                        <input
                                            type="text"
                                            name="new_groupType"
                                            placeholder="새로운 제품군 입력"
                                            onChange={onChange}
                                        />
                                        <button type="button" onClick={insertGroupType}>+</button>
                                    </div>
                                )}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="groupName_input">DT 품명</label>
                                    <input
                                        type="text"
                                        id="groupName_input"
                                        name="groupName"
                                        value={input.groupName}
                                        onChange={onChange}
                                        placeholder="DT 품명 입력"
                                        onFocus={e => e.target.select()}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="itemName_input">은기 품명</label>
                                    <input
                                        type="text"
                                        id="itemName_input"
                                        name="itemName"
                                        value={input.itemName}
                                        onChange={onChange}
                                        placeholder="은기 품명 입력"
                                        onFocus={e => e.target.select()}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {input.type === 'ASSY' && (
                        <div className="form-group">
                            <label htmlFor="itemName_input">결합물 품명</label>
                            <input
                                type="text"
                                id="itemName_input"
                                name="itemName"
                                value={input.itemName}
                                onChange={onChange}
                                placeholder="결합물 품명 입력"
                                onFocus={e => e.target.select()}
                            />
                        </div>
                    )}

                    {input.type === 'PARTS' && (
                        <div className="form-group">
                            <label htmlFor="itemName_input">부품 품명</label>
                            <input
                                type="text"
                                id="itemName_input"
                                name="itemName"
                                value={input.itemName}
                                onChange={onChange}
                                placeholder="부품 품명 입력"
                                onFocus={e => e.target.select()}
                            />
                        </div>
                    )}

                    {/* Description for all types */}
                    <div className="form-group">
                        <label htmlFor="descript_input">설명</label>
                        <textarea
                            id="descript_input"
                            name="descript"
                            value={input.descript}
                            onChange={onChange}
                            placeholder="상세 설명 및 규격 입력"
                            rows={2}
                            onFocus={e => e.target.select()}
                        />
                    </div>

                    {/* 5. BOM 하위 바스켓 */}
                    {input.type === 'SET' && (
                        <div className="bom-basket-section">
                            <div className="basket-header">
                                <div className="basket-title">
                                    <span>BOM 하위 구성품</span>
                                    {dragItems.length > 0 && (
                                        <span className="count-badge">{dragItems.length}건</span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className="basket-toggle-btn"
                                    onClick={() => setIsBasket(!isBasket)}
                                >
                                    {isBasket ? '연결창 닫기' : '연결창 열기'}
                                </button>
                            </div>

                            {isBasket && (
                                <div className="item_basket" onDragEnter={drag_on}>
                                    {T_dragItems && T_dragItems.length > 0 ? (
                                        T_dragItems.map((item) => (
                                            <div className="countControl" key={item.id.toString()}>
                                                <div className="itemName">
                                                    <span className={`type-dot ${item.type} ${item.category}`} />
                                                    <span title={String(item.itemName)}>{item.itemName}</span>
                                                </div>
                                                <div className="material-symbols">
                                                    <span
                                                        className="material-symbols-outlined add"
                                                        onClick={() => addCount(item.id)}
                                                        onMouseDown={() => {
                                                            if (typeof item.id === 'number') inCrease(item.id);
                                                        }}
                                                        onMouseUp={() => {
                                                            clearInterval(inter);
                                                            clearTimeout(tout);
                                                        }}
                                                    >
                                                        add_circle
                                                    </span>
                                                    <span>{item.point}</span>
                                                    <span
                                                        className="material-symbols-outlined remove"
                                                        onClick={() => removeCount(item.id, '')}
                                                        onMouseDown={() => {
                                                            if (typeof item.id === 'number') deCrease(item.id);
                                                        }}
                                                        onMouseUp={() => {
                                                            clearInterval(inter);
                                                            clearTimeout(tout);
                                                        }}
                                                    >
                                                        do_not_disturb_on
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-hint">하위 자재를 드래그하여 등록하세요</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {input.type === 'ASSY' && (
                        <div className="bom-basket-section">
                            <div className="basket-header">
                                <div className="basket-title">
                                    <span>BOM 하위 구성품</span>
                                    {dragItems.length > 0 && (
                                        <span className="count-badge">{dragItems.length}건</span>
                                    )}
                                </div>
                            </div>
                            <div className="item_basket" onDragEnter={drag_on}>
                                {T_dragItems && T_dragItems.length > 0 ? (
                                    T_dragItems.map((item) => (
                                        <div className="countControl" key={item.id.toString()}>
                                            <div className="itemName">
                                                <span className={`type-dot ${item.type} ${item.category}`} />
                                                <span title={String(item.itemName)}>{item.itemName}</span>
                                            </div>
                                            <div className="material-symbols">
                                                <span
                                                    className="material-symbols-outlined add"
                                                    onClick={() => addCount(item.id)}
                                                    onMouseDown={() => {
                                                        if (typeof item.id === 'number') inCrease(item.id);
                                                    }}
                                                    onMouseUp={() => {
                                                        clearInterval(inter);
                                                        clearTimeout(tout);
                                                    }}
                                                >
                                                    add_circle
                                                </span>
                                                <span>{item.point}</span>
                                                <span
                                                    className="material-symbols-outlined remove"
                                                    onClick={() => removeCount(item.id, '')}
                                                    onMouseDown={() => {
                                                        if (typeof item.id === 'number') deCrease(item.id);
                                                    }}
                                                    onMouseUp={() => {
                                                        clearInterval(inter);
                                                        clearTimeout(tout);
                                                    }}
                                                >
                                                    do_not_disturb_on
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-hint">하위 부품을 드래그하여 등록하세요</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 6. Pricing & Currency Section */}
                    {input.type === 'SET' && (
                        <div className="pricing-card">
                            <div className="pricing-header">
                                <span>가격 및 원가 정보</span>
                            </div>
                            <div className="pricing-grid">
                                <div className="form-group">
                                    <label htmlFor="ex_price_input">출고단가</label>
                                    <div className="input-addon">
                                        <span className="addon-prefix">$</span>
                                        <input
                                            type="text"
                                            id="ex_price_input"
                                            name="ex_price"
                                            value={input.ex_price ? input.ex_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ''}
                                            onChange={onChange}
                                            min={0}
                                            placeholder="0"
                                            onFocus={e => e.target.select()}
                                            style={{ textAlign: 'right' }}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="sum_im_price_input">BOM 합산원가</label>
                                    <div className="input-addon">
                                        <span className="addon-prefix">₩</span>
                                        <input
                                            type="text"
                                            id="sum_im_price_input"
                                            readOnly
                                            value={sum_im_price ? sum_im_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0'}
                                            placeholder="자동 계산"
                                            style={{ textAlign: 'right' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {input.type === 'ASSY' && (
                        <div className="pricing-card">
                            <div className="pricing-header">
                                <span>단가 및 원가 정보</span>
                            </div>
                            <div className="pricing-grid three-cols">
                                <div className="form-group">
                                    <label htmlFor="im_price_input">입고단가</label>
                                    <div className="input-addon">
                                        <span className="addon-prefix">₩</span>
                                        <input
                                            type="text"
                                            id="im_price_input"
                                            name="im_price"
                                            value={input.im_price ? input.im_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ''}
                                            onChange={onChange}
                                            min={0}
                                            placeholder="0"
                                            onFocus={e => e.target.select()}
                                            style={{ textAlign: 'right' }}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="sum_im_price_input">BOM 합산원가</label>
                                    <div className="input-addon">
                                        <span className="addon-prefix">₩</span>
                                        <input
                                            type="text"
                                            id="sum_im_price_input"
                                            readOnly
                                            value={sum_im_price ? sum_im_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0'}
                                            placeholder="0"
                                            style={{ textAlign: 'right' }}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="ex_price_input">출고단가</label>
                                    <div className="input-addon">
                                        <span className="addon-prefix">$</span>
                                        <input
                                            type="text"
                                            id="ex_price_input"
                                            name="ex_price"
                                            value={input.ex_price ? input.ex_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ''}
                                            onChange={onChange}
                                            min={0}
                                            placeholder="0"
                                            onFocus={e => e.target.select()}
                                            style={{ textAlign: 'right' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {input.type === 'PARTS' && (
                        <div className="pricing-card">
                            <div className="pricing-header">
                                <span>단가 정보</span>
                                <div className="currency-toggle">
                                    <div className="curr-option">
                                        <input
                                            type="radio"
                                            id="curr_krw_input"
                                            name="unit"
                                            value="\\"
                                            checked={input.unit === "\\" || input.unit === "₩" || input.unit === "￦"}
                                            onChange={onChange}
                                        />
                                        <label htmlFor="curr_krw_input">₩</label>
                                    </div>
                                    <div className="curr-option">
                                        <input
                                            type="radio"
                                            id="curr_usd_input"
                                            name="unit"
                                            value="$"
                                            checked={input.unit === "$"}
                                            onChange={onChange}
                                        />
                                        <label htmlFor="curr_usd_input">$</label>
                                    </div>
                                    <div className="curr-option">
                                        <input
                                            type="radio"
                                            id="curr_cny_input"
                                            name="unit"
                                            value="￥"
                                            checked={input.unit === "￥"}
                                            onChange={onChange}
                                        />
                                        <label htmlFor="curr_cny_input">￥</label>
                                    </div>
                                </div>
                            </div>
                            <div className="pricing-grid">
                                <div className="form-group">
                                    <label htmlFor="im_price_input">입고가격</label>
                                    <div className="input-addon">
                                        <span className="addon-prefix">{formatCurrencySymbol(input.unit)}</span>
                                        <input
                                            type="text"
                                            id="im_price_input"
                                            name="im_price"
                                            value={input.im_price ? input.im_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ''}
                                            onChange={onChange}
                                            placeholder="0"
                                            onFocus={e => e.target.select()}
                                            style={{ textAlign: 'right' }}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="ex_price_input">출고가격</label>
                                    <div className="input-addon">
                                        <span className="addon-prefix">$</span>
                                        <input
                                            type="text"
                                            id="ex_price_input"
                                            name="ex_price"
                                            value={input.ex_price ? input.ex_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ''}
                                            onChange={onChange}
                                            placeholder="0"
                                            onFocus={e => e.target.select()}
                                            style={{ textAlign: 'right' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 7. Logistics & Packing (SET only) */}
                    {input.type === 'SET' && (
                        <div className="logistics-card">
                            <div className="logistics-header">
                                <span>물류 & 포장 규격</span>
                                <div className="unit-selector">
                                    <span className="unit-label">포장단위</span>
                                    <div className="unit-toggle">
                                        <input
                                            type="radio"
                                            name="set"
                                            id="unit_set_input"
                                            value="1"
                                            onChange={onChange}
                                            checked={Boolean(input.set)}
                                        />
                                        <label htmlFor="unit_set_input">SET</label>
                                        <input
                                            type="radio"
                                            name="set"
                                            id="unit_ea_input"
                                            value="0"
                                            onChange={onChange}
                                            checked={!input.set}
                                        />
                                        <label htmlFor="unit_ea_input">EA</label>
                                    </div>
                                </div>
                            </div>
                            <div className="logistics-grid">
                                <div className="form-group">
                                    <label htmlFor="weight_input">중량 (kg)</label>
                                    <input
                                        type="text"
                                        name="weight"
                                        id="weight_input"
                                        value={input.weight || ''}
                                        onChange={onChange}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="cbm_input">CBM (㎥)</label>
                                    <input
                                        type="text"
                                        name="cbm"
                                        id="cbm_input"
                                        value={input.cbm || ''}
                                        onChange={onChange}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="moq_input">MOQ (EA)</label>
                                    <input
                                        type="text"
                                        name="moq"
                                        id="moq_input"
                                        value={input.moq || ''}
                                        onChange={onChange}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 8. Supplier & Usage Section (Common for ALL types) */}
                    <div className="supplier-status-row">
                        <div className="supplier-col">
                            <div className="form-group">
                                <label htmlFor="supplyer_input">공급자</label>
                                <select
                                    value={input.supplyer}
                                    name="supplyer"
                                    id="supplyer_input"
                                    onChange={onChange}
                                >
                                    <option value="">공급자 선택</option>
                                    {supplyers && supplyers.map(supplyer => (
                                        <option key={supplyer} value={supplyer}>{supplyer}</option>
                                    ))}
                                    <option value="New">➕ 신규 공급자</option>
                                </select>
                                {input.supplyer === 'New' && (
                                    <div className="inline-add">
                                        <input
                                            type="text"
                                            name="new_supplyer"
                                            placeholder="새 공급자명"
                                            onChange={onChange}
                                        />
                                        <button type="button" onClick={insertSupplyer}>+</button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="status-col">
                            <div className="form-group">
                                <label>사용 여부</label>
                                <div className="status-toggle">
                                    <div className="status-option">
                                        <input
                                            type="radio"
                                            id="use_active_input"
                                            name="use"
                                            value="1"
                                            onChange={onChange}
                                            checked={Boolean(input.use)}
                                        />
                                        <label htmlFor="use_active_input" className="use-active">사용</label>
                                    </div>
                                    <div className="status-option">
                                        <input
                                            type="radio"
                                            id="use_inactive_input"
                                            name="use"
                                            value="0"
                                            onChange={onChange}
                                            checked={!input.use}
                                        />
                                        <label htmlFor="use_inactive_input" className="use-inactive">미사용</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 9. Image Upload & Previews */}
                    <div className="image-section">
                        <div className="upload-trigger">
                            <input
                                type="file"
                                id="file_input"
                                name="images"
                                onChange={insertImage}
                                multiple
                                accept="image/*"
                            />
                            <label htmlFor="file_input">
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                    add_photo_alternate
                                </span>
                                이미지 첨부 {imageList.length > 0 && `(${imageList.length}장)`}
                            </label>
                        </div>
                        {imageList.length > 0 && (
                            <div className="image-gallery">
                                {imageList.map((image, index) => (
                                    <div key={index} className="image-card">
                                        <img src={image.url} alt={`upload-${index}`} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 10. Action Buttons */}
                    <div className="form-actions">
                        <div className="left-actions">
                            <label htmlFor="excel" className="excel-btn-label" title="엑셀 파일 등록">
                                <img src="/images/excel_btn.png" alt="Excel" />
                            </label>
                            <input type="file" id="excel" onChange={excel_onChange} ref={excelFile} />
                            {file && (
                                <button type="button" className="excel-submit-btn" onClick={excel_onSubmit}>
                                    엑셀 등록
                                </button>
                            )}
                        </div>
                        <div className="right-actions">
                            <button type="button" className="cancel-btn" onClick={formClose}>
                                닫기
                            </button>
                            <button type="submit" className="submit-btn">
                                등록
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default InputFormComponent;