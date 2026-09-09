import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { response } from '../../../store/slices/authSlice';
import { formatCurrencySymbol } from '../../../lib/utils/formatCurrency';

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
        [key: string]: string | number | boolean | { groupName: string } | { url: string }[] | undefined,
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
        new_groupType?: string,
        new_supplyer?: string,
        sets?: string,
    };
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
    insertGroupType: () => void;
    insertSupplyer: () => void;
    dragItems: { [key: string]: string | number | boolean }[] | null;
    addCount: (targetId: number | string | boolean, itemId: number | string | boolean) => void;
    removeCount: (targetId: number | string | boolean, itemId: number | string | boolean, mode: string) => void;
    drag_on: (targetId: number, itemId: number) => void;
    dragedItem: { id: number } | null;
    relations: { UpperId: number, LowerId: number, point: number }[] | null;
    totalPrice: number;
    viewMode: boolean;
    drag_on_relation: (targetId: number, itemId: number) => void;
};

const EditFormComponent: React.FC<Props> = ({
    prev, next, onChange, editImage, editItem, removeItem, removeImage, closeForm,
    goodType, supplyers, insertGroupType, insertSupplyer, dragItems, addCount,
    removeCount, drag_on, dragedItem, totalPrice, viewMode
}) => {
    const { auth } = useSelector(response);
    const isManagerOrAdmin = auth?.role === 'ADMIN' || auth?.role === 'MANAGER';
    const isAdmin = auth?.role === 'ADMIN';

    const [inter, setInter] = useState<NodeJS.Timeout | undefined>(undefined);
    const [tout, setTout] = useState<NodeJS.Timeout | undefined>(undefined);

    const inCrease = (targetId: number, id: number) => {
        setTout(setTimeout(() => {
            setInter(setInterval(() => {
                addCount(targetId, id);
            }, 100));
        }, 500));
    };

    const deCrease = (targetId: number, id: number) => {
        setTout(setTimeout(() => {
            setInter(setInterval(() => {
                removeCount(targetId, id, 'cont');
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
        <div className="form-type">
            {/* 1. Header */}
            <div className={`title ${next.type}`}>
                <div className="title-left">
                    <span className="mode-badge">EDIT</span>
                    <span className="type-badge">{typeBadgeText[next.type] || next.type}</span>
                </div>
                <button type="button" className="title-close-btn" onClick={closeForm} title="닫기">
                    ✕
                </button>
            </div>

            <form className="edit-form" onSubmit={(e) => {
                e.preventDefault();
                const changedProps: {
                    [key: string]: '' | number | string | boolean | { groupName: string } | { url: string }[],
                } = {};
                const keys = Object.keys(next);
                for (let key of keys) {
                    if (prev[key] !== next[key] && next[key] !== undefined) {
                        changedProps[key] = next[key] as any;
                    }
                }
                const newItem = {
                    id: next.id,
                    ...changedProps,
                    dragItems: dragItems || [],
                    mode: 'rest'
                };
                editItem(newItem);
            }}>
                <div className={`form-category ${next.category}`}>
                    {/* 2. Type Segmented Control */}
                    <div className="type-segment-control">
                        <div className="segment-item">
                            <input
                                type="radio"
                                id="type_SET_edit"
                                name="type"
                                value="SET"
                                checked={next.type === 'SET'}
                                onChange={onChange}
                            />
                            <label htmlFor="type_SET_edit">제품 (SET)</label>
                        </div>
                        <div className="segment-item">
                            <input
                                type="radio"
                                id="type_ASSY_edit"
                                name="type"
                                value="ASSY"
                                checked={next.type === 'ASSY'}
                                onChange={onChange}
                            />
                            <label htmlFor="type_ASSY_edit">결합 (ASSY)</label>
                        </div>
                        <div className="segment-item">
                            <input
                                type="radio"
                                id="type_PARTS_edit"
                                name="type"
                                value="PARTS"
                                checked={next.type === 'PARTS'}
                                onChange={onChange}
                            />
                            <label htmlFor="type_PARTS_edit">부품 (PARTS)</label>
                        </div>
                    </div>

                    {/* 3. Category Chips */}
                    <div className="category-chips">
                        {(next.type === 'SET' ? setCategories : partsCategories).map((cat) => (
                            <div className="chip-item" key={cat}>
                                <input
                                    type="radio"
                                    id={`cat_${cat}_edit`}
                                    name="category"
                                    value={cat}
                                    checked={next.category === cat}
                                    onChange={onChange}
                                />
                                <label htmlFor={`cat_${cat}_edit`} className={`chip-${cat}`}>
                                    {cat}
                                </label>
                            </div>
                        ))}
                    </div>

                    {/* 4. Basic Information */}
                    {next.type === 'SET' && (
                        <>
                            <div className="form-group">
                                <label htmlFor="groupType_edit">제품군 (Group Type)</label>
                                <select
                                    id="groupType_edit"
                                    value={next.groupType}
                                    name="groupType"
                                    onChange={onChange}
                                >
                                    <option value="">제품군 선택</option>
                                    {goodType.filter(type => type.category === next.category).map(type => (
                                        <option value={type.type} key={type.type}>{type.type}</option>
                                    ))}
                                    <option value="New">➕ 새로운 제품군 추가</option>
                                </select>
                                {next.groupType === 'New' && (
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
                                    <label htmlFor="groupName_edit">DT 품명</label>
                                    <input
                                        type="text"
                                        id="groupName_edit"
                                        name="groupName"
                                        value={next.Good ? next.Good.groupName : ((next.groupName as string) || '')}
                                        onChange={onChange}
                                        placeholder="DT 품명 입력"
                                        onFocus={e => e.target.select()}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="itemName_edit">은기 품명</label>
                                    <input
                                        type="text"
                                        id="itemName_edit"
                                        name="itemName"
                                        value={next.itemName}
                                        onChange={onChange}
                                        placeholder="은기 품명 입력"
                                        onFocus={e => e.target.select()}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {next.type === 'ASSY' && (
                        <div className="form-group">
                            <label htmlFor="itemName_edit">결합물 품명</label>
                            <input
                                type="text"
                                id="itemName_edit"
                                name="itemName"
                                value={next.itemName}
                                onChange={onChange}
                                placeholder="결합물 품명 입력"
                                onFocus={e => e.target.select()}
                            />
                        </div>
                    )}

                    {next.type === 'PARTS' && (
                        <div className="form-group">
                            <label htmlFor="itemName_edit">부품 품명</label>
                            <input
                                type="text"
                                id="itemName_edit"
                                name="itemName"
                                value={next.itemName}
                                onChange={onChange}
                                placeholder="부품 품명 입력"
                                onFocus={e => e.target.select()}
                            />
                        </div>
                    )}

                    {/* Description for all types */}
                    <div className="form-group">
                        <label htmlFor="descript_edit">설명</label>
                        <textarea
                            id="descript_edit"
                            name="descript"
                            value={next.descript}
                            onChange={onChange}
                            placeholder="상세 설명 및 규격 입력"
                            rows={2}
                            onFocus={e => e.target.select()}
                        />
                    </div>

                    {/* 5. BOM 하위 바스켓 */}
                    {next.type === 'SET' && (
                        <div className="bom-basket-section">
                            <div className="basket-header">
                                <div className="basket-title">
                                    <span>BOM 하위 구성품</span>
                                    {dragItems && dragItems.length > 0 && (
                                        <span className="count-badge">{dragItems.length}건</span>
                                    )}
                                </div>
                            </div>
                            <div className="item_basket" onDragEnter={() => {
                                if (dragedItem) drag_on(next.id, dragedItem.id);
                            }}>
                                {dragItems && dragItems.length > 0 ? (
                                    dragItems.map((dragitem) => (
                                        <div className="countControl" key={dragitem.id.toString()}>
                                            <div className="itemName">
                                                <span className={`type-dot ${dragitem.type} ${dragitem.category}`} />
                                                <span title={String(dragitem.itemName)}>{dragitem.itemName}</span>
                                            </div>
                                            <div className="material-symbols">
                                                <span
                                                    className="material-symbols-outlined add"
                                                    onClick={() => addCount(dragitem.targetId, dragitem.id)}
                                                    onMouseDown={() => {
                                                        if (typeof dragitem.targetId === 'number' && typeof dragitem.id === 'number') {
                                                            inCrease(dragitem.targetId, dragitem.id);
                                                        }
                                                    }}
                                                    onMouseUp={() => {
                                                        clearInterval(inter);
                                                        clearTimeout(tout);
                                                    }}
                                                >
                                                    add_circle
                                                </span>
                                                <span>{dragitem.point}</span>
                                                <span
                                                    className="material-symbols-outlined remove"
                                                    onClick={() => removeCount(dragitem.targetId, dragitem.id, '')}
                                                    onMouseDown={() => {
                                                        if (typeof dragitem.targetId === 'number' && typeof dragitem.id === 'number') {
                                                            deCrease(dragitem.targetId, dragitem.id);
                                                        }
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
                                    <div className="empty-hint">하위 자재를 드래그하여 연결하세요</div>
                                )}
                            </div>
                        </div>
                    )}

                    {next.type === 'ASSY' && (
                        <div className="bom-basket-section">
                            <div className="basket-header">
                                <div className="basket-title">
                                    <span>BOM 하위 구성품</span>
                                    {dragItems && dragItems.length > 0 && (
                                        <span className="count-badge">{dragItems.length}건</span>
                                    )}
                                </div>
                            </div>
                            <div
                                className="item_basket"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => {
                                    if (viewMode) {
                                        alert('구현 준비 중 입니다.');
                                    } else {
                                        if (dragedItem) drag_on(next.id, dragedItem.id);
                                    }
                                }}
                            >
                                {dragItems && dragItems.length > 0 ? (
                                    dragItems.map((dragitem) => (
                                        <div className="countControl" key={dragitem.id.toString()}>
                                            <div className="itemName">
                                                <span className={`type-dot ${dragitem.type} ${dragitem.category}`} />
                                                <span title={String(dragitem.itemName)}>{dragitem.itemName}</span>
                                            </div>
                                            <div className="material-symbols">
                                                <span
                                                    className="material-symbols-outlined add"
                                                    onClick={() => addCount(dragitem.targetId, dragitem.id)}
                                                    onMouseDown={() => {
                                                        if (typeof dragitem.targetId === 'number' && typeof dragitem.id === 'number') {
                                                            inCrease(dragitem.targetId, dragitem.id);
                                                        }
                                                    }}
                                                    onMouseUp={() => {
                                                        clearInterval(inter);
                                                        clearTimeout(tout);
                                                    }}
                                                >
                                                    add_circle
                                                </span>
                                                <span>{dragitem.point}</span>
                                                <span
                                                    className="material-symbols-outlined remove"
                                                    onClick={() => removeCount(dragitem.targetId, dragitem.id, '')}
                                                    onMouseDown={() => {
                                                        if (typeof dragitem.targetId === 'number' && typeof dragitem.id === 'number') {
                                                            deCrease(dragitem.targetId, dragitem.id);
                                                        }
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
                                    <div className="empty-hint">하위 부품을 드래그하여 연결하세요</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 6. Pricing & Currency Section */}
                    {next.type === 'SET' && (
                        <div className="pricing-card">
                            <div className="pricing-header">
                                <span>가격 및 원가 정보</span>
                            </div>
                            <div className="pricing-grid">
                                <div className="form-group">
                                    <label htmlFor="ex_price_edit">출고단가</label>
                                    <div className="input-addon">
                                        <span className="addon-prefix">$</span>
                                        <input
                                            type="text"
                                            id="ex_price_edit"
                                            name="ex_price"
                                            value={next.ex_price ? next.ex_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ''}
                                            onChange={onChange}
                                            min={0}
                                            placeholder="0"
                                            onFocus={e => e.target.select()}
                                            style={{ textAlign: 'right' }}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="sum_im_price_edit">BOM 합산원가</label>
                                    <div className="input-addon">
                                        <span className="addon-prefix">₩</span>
                                        <input
                                            type="text"
                                            id="sum_im_price_edit"
                                            readOnly
                                            value={totalPrice ? totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0'}
                                            placeholder="0"
                                            style={{ textAlign: 'right' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {next.type === 'ASSY' && (
                        <div className="pricing-card">
                            <div className="pricing-header">
                                <span>단가 및 원가 정보</span>
                            </div>
                            <div className="pricing-grid three-cols">
                                <div className="form-group">
                                    <label htmlFor="im_price_edit">입고단가</label>
                                    <div className="input-addon">
                                        <span className="addon-prefix">₩</span>
                                        <input
                                            type="text"
                                            id="im_price_edit"
                                            name="im_price"
                                            value={next.im_price ? next.im_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ''}
                                            onChange={onChange}
                                            min={0}
                                            placeholder="0"
                                            onFocus={e => e.target.select()}
                                            style={{ textAlign: 'right' }}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="sum_im_price_edit">BOM 합산원가</label>
                                    <div className="input-addon">
                                        <span className="addon-prefix">₩</span>
                                        <input
                                            type="text"
                                            id="sum_im_price_edit"
                                            readOnly
                                            value={totalPrice ? totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0'}
                                            placeholder="0"
                                            style={{ textAlign: 'right' }}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="ex_price_edit">출고단가</label>
                                    <div className="input-addon">
                                        <span className="addon-prefix">$</span>
                                        <input
                                            type="text"
                                            id="ex_price_edit"
                                            name="ex_price"
                                            value={next.ex_price ? next.ex_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ''}
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

                    {next.type === 'PARTS' && (
                        <div className="pricing-card">
                            <div className="pricing-header">
                                <span>단가 정보</span>
                                <div className="currency-toggle">
                                    <div className="curr-option">
                                        <input
                                            type="radio"
                                            id="curr_krw_edit"
                                            name="unit"
                                            value="\\"
                                            checked={next.unit === "\\" || next.unit === "₩" || next.unit === "￦"}
                                            onChange={onChange}
                                        />
                                        <label htmlFor="curr_krw_edit">₩</label>
                                    </div>
                                    <div className="curr-option">
                                        <input
                                            type="radio"
                                            id="curr_usd_edit"
                                            name="unit"
                                            value="$"
                                            checked={next.unit === "$"}
                                            onChange={onChange}
                                        />
                                        <label htmlFor="curr_usd_edit">$</label>
                                    </div>
                                    <div className="curr-option">
                                        <input
                                            type="radio"
                                            id="curr_cny_edit"
                                            name="unit"
                                            value="￥"
                                            checked={next.unit === "￥"}
                                            onChange={onChange}
                                        />
                                        <label htmlFor="curr_cny_edit">￥</label>
                                    </div>
                                </div>
                            </div>
                            <div className="pricing-grid">
                                <div className="form-group">
                                    <label htmlFor="im_price_edit">입고가격</label>
                                    <div className="input-addon">
                                        <span className="addon-prefix">{formatCurrencySymbol(next.unit as string)}</span>
                                        <input
                                            type="text"
                                            id="im_price_edit"
                                            name="im_price"
                                            value={next.im_price ? next.im_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ''}
                                            onChange={onChange}
                                            placeholder="0"
                                            onFocus={e => e.target.select()}
                                            style={{ textAlign: 'right' }}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="ex_price_edit">출고가격</label>
                                    <div className="input-addon">
                                        <span className="addon-prefix">$</span>
                                        <input
                                            type="text"
                                            id="ex_price_edit"
                                            name="ex_price"
                                            value={next.ex_price ? next.ex_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ''}
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
                    {next.type === 'SET' && (
                        <div className="logistics-card">
                            <div className="logistics-header">
                                <span>물류 & 포장 규격</span>
                                <div className="unit-selector">
                                    <span className="unit-label">포장단위</span>
                                    <div className="unit-toggle">
                                        <input
                                            type="radio"
                                            name="set"
                                            id="unit_set_edit"
                                            value="1"
                                            onChange={onChange}
                                            checked={Boolean(next.set) || next.sets === "SET"}
                                        />
                                        <label htmlFor="unit_set_edit">SET</label>
                                        <input
                                            type="radio"
                                            name="set"
                                            id="unit_ea_edit"
                                            value="0"
                                            onChange={onChange}
                                            checked={(!next.set && next.sets !== "SET") || next.sets === "EA"}
                                        />
                                        <label htmlFor="unit_ea_edit">EA</label>
                                    </div>
                                </div>
                            </div>
                            <div className="logistics-grid">
                                <div className="form-group">
                                    <label htmlFor="weight_edit">중량 (kg)</label>
                                    <input
                                        type="text"
                                        name="weight"
                                        id="weight_edit"
                                        value={next.weight ?? ''}
                                        onChange={onChange}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="cbm_edit">CBM (㎥)</label>
                                    <input
                                        type="text"
                                        name="cbm"
                                        id="cbm_edit"
                                        value={next.cbm ?? ''}
                                        onChange={onChange}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="moq_edit">MOQ (EA)</label>
                                    <input
                                        type="text"
                                        name="moq"
                                        id="moq_edit"
                                        value={next.moq ?? ''}
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
                                <label htmlFor="supplyer_edit">공급자</label>
                                <select
                                    value={next.supplyer || ''}
                                    name="supplyer"
                                    id="supplyer_edit"
                                    onChange={onChange}
                                >
                                    <option value="">{next.supplyer ? next.supplyer : '공급자 선택'}</option>
                                    {supplyers && supplyers.map(supplyer => (
                                        <option key={supplyer} value={supplyer}>{supplyer}</option>
                                    ))}
                                    <option value="New">➕ 신규 공급자</option>
                                </select>
                                {next.supplyer === 'New' && (
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
                                            id="use_active_edit"
                                            name="use"
                                            value="1"
                                            onChange={onChange}
                                            checked={Boolean(next.use)}
                                        />
                                        <label htmlFor="use_active_edit" className="use-active">사용</label>
                                    </div>
                                    <div className="status-option">
                                        <input
                                            type="radio"
                                            id="use_inactive_edit"
                                            name="use"
                                            value="0"
                                            onChange={onChange}
                                            checked={!next.use}
                                        />
                                        <label htmlFor="use_inactive_edit" className="use-inactive">미사용</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 9. Image Upload & Thumbnails */}
                    <div className="image-section">
                        <div className="upload-trigger">
                            <input
                                type="file"
                                id="file_edit"
                                name="images"
                                onChange={editImage}
                                multiple
                                accept="image/*"
                            />
                            <label htmlFor="file_edit">
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                    add_photo_alternate
                                </span>
                                이미지 추가 {next.Images && next.Images.length > 0 && `(${next.Images.length}장)`}
                            </label>
                        </div>
                        {next.Images && next.Images.length > 0 && (
                            <div className="image-gallery">
                                {next.Images.map((image, index) => (
                                    <div key={index} className="image-card" title="삭제하려면 ✕를 클릭하세요">
                                        <img src={image.url} alt={`edit-img-${index}`} />
                                        <span
                                            className="delete-overlay"
                                            onClick={() => removeImage(next.id, image.url)}
                                            title="이미지 삭제"
                                        >
                                            ✕
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 10. Action Buttons */}
                    <div className="form-actions">
                        <div className="left-actions">
                            {isAdmin && (
                                <button
                                    type="button"
                                    className="delete-btn"
                                    onClick={() => removeItem(next.id)}
                                >
                                    삭제
                                </button>
                            )}
                        </div>
                        <div className="right-actions">
                            <button type="button" className="cancel-btn" onClick={closeForm}>
                                닫기
                            </button>
                            {isManagerOrAdmin && (
                                <button type="submit" className="submit-btn">
                                    수정
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditFormComponent;