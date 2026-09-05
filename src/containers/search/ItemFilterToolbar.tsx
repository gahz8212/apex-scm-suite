import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SearchActions, SearchData } from '../../store/slices/searchSlice';
import { itemData } from '../../store/slices/itemSlice';

type Props = {
    hideSetFilter?: boolean;
    placeholder?: string;
};

const ItemFilterToolbar: React.FC<Props> = ({
    hideSetFilter = false,
    placeholder = '부품명 또는 규격 검색...',
}) => {
    const dispatch = useDispatch();
    const { search } = useSelector(SearchData);
    const { items } = useSelector(itemData);

    const [isExpanded, setIsExpanded] = useState(false);
    const [searchText, setSearchText] = useState('');

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchText(value);
        const exp = new RegExp(value, 'i');
        if (items) {
            const result = items.filter((item) => exp.test(item.itemName));
            dispatch(SearchActions.getFilteredItems(result));
        }
    };

    const clearSearch = () => {
        setSearchText('');
        if (items) {
            dispatch(SearchActions.getFilteredItems(items));
        }
    };

    const handleTypeChipClick = (typeKey: 'SET' | 'ASSY' | 'PARTS') => {
        dispatch(SearchActions.checkType(typeKey));
    };

    const handleAllTypeClick = () => {
        const nextValue = !search.all.typeALL;
        dispatch(SearchActions.typeALL(nextValue));
    };

    const handleCategoryToggle = (category: string, isSetCategory: boolean) => {
        if (isSetCategory) {
            dispatch(SearchActions.checkSet(category));
        } else {
            dispatch(SearchActions.checkGroup(category));
        }
    };

    const handleSortToggle = (sortKey: string) => {
        dispatch(SearchActions.checkSort(sortKey));
    };

    const handleAscToggle = (sortKey: string) => {
        dispatch(SearchActions.checkAsc(sortKey));
    };

    const sortLabels: { [key: string]: string } = {
        type: '타입',
        category: '분류',
        itemName: '품목명',
        createdAt: '생성일',
    };

    return (
        <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            boxSizing: 'border-box',
            width: '100%',
        }}>
            {/* 기본 1열: 검색창 + 빠른 타입 칩 + 상세 필터 버튼 */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
            }}>
                {/* 검색 입력창 */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '0.35rem 0.75rem',
                    flex: '1 1 240px',
                    maxWidth: '360px',
                    position: 'relative',
                }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem', marginRight: '0.5rem' }}>🔍</span>
                    <input
                        type="text"
                        value={searchText}
                        onChange={handleSearchChange}
                        placeholder={placeholder}
                        style={{
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            width: '100%',
                            fontSize: '0.9rem',
                            color: '#1e293b',
                        }}
                    />
                    {searchText && (
                        <button
                            onClick={clearSearch}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                padding: 0,
                            }}
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* 빠른 타입 칩 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>타입:</span>
                    <button
                        type="button"
                        onClick={handleAllTypeClick}
                        style={{
                            padding: '0.3rem 0.65rem',
                            borderRadius: '4px',
                            border: '1px solid',
                            borderColor: search.all.typeALL ? '#2563eb' : '#cbd5e1',
                            background: search.all.typeALL ? '#eff6ff' : '#ffffff',
                            color: search.all.typeALL ? '#2563eb' : '#475569',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                        }}
                    >
                        ALL
                    </button>
                    {!hideSetFilter && (
                        <button
                            type="button"
                            onClick={() => handleTypeChipClick('SET')}
                            style={{
                                padding: '0.3rem 0.65rem',
                                borderRadius: '4px',
                                border: '1px solid',
                                borderColor: search.type.SET ? '#2563eb' : '#cbd5e1',
                                background: search.type.SET ? '#eff6ff' : '#ffffff',
                                color: search.type.SET ? '#2563eb' : '#475569',
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                            }}
                        >
                            SET (완성품)
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => handleTypeChipClick('ASSY')}
                        style={{
                            padding: '0.3rem 0.65rem',
                            borderRadius: '4px',
                            border: '1px solid',
                            borderColor: search.type.ASSY ? '#0f766e' : '#cbd5e1',
                            background: search.type.ASSY ? '#f0fdfa' : '#ffffff',
                            color: search.type.ASSY ? '#0f766e' : '#475569',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                        }}
                    >
                        ASSY (조립품)
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTypeChipClick('PARTS')}
                        style={{
                            padding: '0.3rem 0.65rem',
                            borderRadius: '4px',
                            border: '1px solid',
                            borderColor: search.type.PARTS ? '#475569' : '#cbd5e1',
                            background: search.type.PARTS ? '#f1f5f9' : '#ffffff',
                            color: search.type.PARTS ? '#1e293b' : '#475569',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                        }}
                    >
                        PARTS (자재)
                    </button>
                </div>

                {/* 상세 필터/정렬 토글 버튼 */}
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: isExpanded ? '#f1f5f9' : '#ffffff',
                        color: isExpanded ? '#2563eb' : '#334155',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                    }}
                >
                    <span>필터 & 정렬</span>
                    <span style={{ fontSize: '0.75rem' }}>{isExpanded ? '▲' : '▼'}</span>
                </button>
            </div>

            {/* 확장 상세 패널 */}
            {isExpanded && (
                <div style={{
                    marginTop: '0.75rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                }}>
                    {/* 카테고리 필터 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, minWidth: '70px' }}>자재 분류:</span>
                        {['회로', '전장', '기구', '포장', '기타'].map((groupName) => (
                            <label key={groupName} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#334155', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={Boolean(search.group[groupName])}
                                    onChange={() => handleCategoryToggle(groupName, false)}
                                />
                                {groupName}
                            </label>
                        ))}
                    </div>

                    {/* 정렬 순서 및 차순 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, minWidth: '70px' }}>정렬 기준:</span>
                        {Object.keys(sortLabels).map((sortKey) => {
                            const sortItem = search.sort[sortKey];
                            return (
                                <div key={sortKey} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => handleSortToggle(sortKey)}
                                        style={{
                                            padding: '0.25rem 0.55rem',
                                            borderRadius: '4px',
                                            border: '1px solid',
                                            borderColor: sortItem.active ? '#2563eb' : '#e2e8f0',
                                            background: sortItem.active ? '#eff6ff' : '#f8fafc',
                                            color: sortItem.active ? '#2563eb' : '#64748b',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {sortLabels[sortKey]}
                                    </button>
                                    {sortItem.active && (
                                        <button
                                            type="button"
                                            onClick={() => handleAscToggle(sortKey)}
                                            style={{
                                                padding: '0.25rem 0.4rem',
                                                borderRadius: '4px',
                                                border: '1px solid #cbd5e1',
                                                background: '#ffffff',
                                                fontSize: '0.75rem',
                                                cursor: 'pointer',
                                                color: '#334155',
                                            }}
                                            title={sortItem.asc ? '오름차순' : '내림차순'}
                                        >
                                            {sortItem.asc ? '↑ 오름' : '↓ 내림'}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItemFilterToolbar;
