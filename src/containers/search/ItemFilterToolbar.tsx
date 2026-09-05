import React, { useState, useEffect, useRef } from 'react';
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

    // D&D 정렬 우선순위 상태
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    const [orders, setOrders] = useState<{ name: string; sorting: string }[]>([
        { name: '타입', sorting: 'type' },
        { name: '분류', sorting: 'category' },
        { name: '이름', sorting: 'itemName' },
        { name: '생성일', sorting: 'createdAt' },
    ]);

    // 1. D&D 핸들러
    const onDragStart = (index: number) => {
        dragItem.current = index;
    };

    const onDragEnter = (index: number) => {
        dragOverItem.current = index;
    };

    const onDrop = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const copyList = JSON.parse(JSON.stringify(orders));
        const temp = copyList[dragOverItem.current];
        copyList[dragOverItem.current] = copyList[dragItem.current];
        copyList[dragItem.current] = temp;

        dispatch(
            SearchActions.sortChange({
                dragItem: dragItem.current,
                dragOverItem: dragOverItem.current,
                orders: orders,
            })
        );
        dragItem.current = null;
        dragOverItem.current = null;
        setOrders(copyList);
    };

    // 2. 통합 필터 및 정렬 연산 이펙트
    useEffect(() => {
        if (!items) return;

        // (1) 타입 및 카테고리 필터링
        const { all, ...rest } = search;
        let result: any[] = [];
        if (search.type.SET && !search.type.PARTS && !search.type.ASSY) {
            result = items.filter(
                (item) => rest.type[item.type] && rest.set[item.category]
            );
        } else if ((search.type.PARTS || search.type.ASSY) && !search.type.SET) {
            result = items.filter(
                (item) => rest.type[item.type] && rest.group[item.category]
            );
        } else {
            result = items.filter((item) => rest.type[item.type]);
        }

        // (2) 검색어 필터링
        if (searchText.trim()) {
            const exp = new RegExp(searchText.trim(), 'i');
            result = result.filter((item) => exp.test(item.itemName));
        }

        // (3) 4단계 D&D 우선순위 복합 정렬
        const array = search.sort;
        const keys = Object.keys(array);
        const values = Object.values(array);
        const resultSort: { key: string; active: boolean; number: number; asc: boolean }[] = [];
        for (let i = 0; i < keys.length; i++) {
            resultSort.push({ key: keys[i], ...(values[i] as any) });
        }

        const orderedSort = resultSort
            .sort((a, b) => a.number - b.number)
            .filter((sort) => sort.active)
            .map((sort) => ({ key: sort.key, asc: sort.asc }));

        const sortedResult = [...result];

        sortedResult.sort((prev: any, next: any) => {
            for (let i = 0; i < orderedSort.length; i++) {
                const { key, asc } = orderedSort[i];
                const valA = String(prev[key] ?? '');
                const valB = String(next[key] ?? '');
                const cmp = asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
                if (cmp !== 0) return cmp;
            }
            return 0;
        });

        dispatch(SearchActions.getFilteredItems(sortedResult));
    }, [
        dispatch,
        search.type,
        search.set,
        search.group,
        search.sort,
        items,
        searchText,
    ]);

    // 3. 타입 체크 올 상태 동기화
    useEffect(() => {
        if (search) {
            if (search.type.SET && search.type.ASSY && search.type.PARTS) {
                dispatch(SearchActions.typeCheckAll(true));
            } else {
                dispatch(SearchActions.typeCheckAll(false));
            }
            if (
                search.set.EDT &&
                search.set.NOBARK &&
                search.set.RDT &&
                search.set.LAUNCHER &&
                search.set.기타
            ) {
                dispatch(SearchActions.setCheckAll(true));
            } else {
                dispatch(SearchActions.setCheckAll(false));
            }
            if (
                search.group.포장 &&
                search.group.회로 &&
                search.group.전장 &&
                search.group.기구 &&
                search.group.기타
            ) {
                dispatch(SearchActions.groupCheckAll(true));
            } else {
                dispatch(SearchActions.groupCheckAll(false));
            }
        }
    }, [dispatch, search.type, search.set, search.group]);

    return (
        <div
            style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                padding: '0.75rem 1rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                boxSizing: 'border-box',
                width: '100%',
            }}
        >
            {/* 기본 1열: 검색창 + 빠른 타입 필터 칩 + 상세 필터 버튼 */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                }}
            >
                {/* 검색 입력창 */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '0.35rem 0.75rem',
                        flex: '1 1 240px',
                        maxWidth: '380px',
                    }}
                >
                    <span style={{ color: '#64748b', fontSize: '0.9rem', marginRight: '0.5rem' }}>
                        🔍
                    </span>
                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
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
                            type="button"
                            onClick={() => setSearchText('')}
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
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                        타입:
                    </span>
                    <button
                        type="button"
                        onClick={() => dispatch(SearchActions.typeALL(!search.all.typeALL))}
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
                            onClick={() => dispatch(SearchActions.checkType('SET'))}
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
                        onClick={() => dispatch(SearchActions.checkType('ASSY'))}
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
                        onClick={() => dispatch(SearchActions.checkType('PARTS'))}
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
                        background: isExpanded ? '#eff6ff' : '#ffffff',
                        color: isExpanded ? '#2563eb' : '#334155',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                    }}
                >
                    <span>상세 필터 & 정렬 우선순위</span>
                    <span style={{ fontSize: '0.75rem' }}>{isExpanded ? '▲' : '▼'}</span>
                </button>
            </div>

            {/* 확장 상세 패널: 카테고리 체크박스 + D&D 정렬 우선순위 바 */}
            {isExpanded && (
                <div
                    style={{
                        marginTop: '0.75rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid #f1f5f9',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.85rem',
                    }}
                >
                    {/* (A) 자재 분류 필터 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, minWidth: '85px' }}>
                            자재 분류:
                        </span>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#334155', cursor: 'pointer', fontWeight: 600 }}>
                            <input
                                type="checkbox"
                                checked={Boolean(search.all.groupALL)}
                                onChange={(e) => dispatch(SearchActions.groupALL(e.target.checked))}
                            />
                            전체
                        </label>
                        {['회로', '전장', '기구', '포장', '기타'].map((groupName) => (
                            <label
                                key={groupName}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    fontSize: '0.85rem',
                                    color: '#334155',
                                    cursor: 'pointer',
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={Boolean(search.group[groupName])}
                                    onChange={() => dispatch(SearchActions.checkGroup(groupName))}
                                />
                                {groupName}
                            </label>
                        ))}
                    </div>

                    {/* (B) SET 카테고리 필터 (SET 활성화 시) */}
                    {!hideSetFilter && search.type.SET && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, minWidth: '85px' }}>
                                모델 분류:
                            </span>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#334155', cursor: 'pointer', fontWeight: 600 }}>
                                <input
                                    type="checkbox"
                                    checked={Boolean(search.all.setALL)}
                                    onChange={(e) => dispatch(SearchActions.setALL(e.target.checked))}
                                />
                                전체
                            </label>
                            {['EDT', 'NOBARK', 'RDT', 'LAUNCHER', '기타'].map((setName) => (
                                <label
                                    key={setName}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.3rem',
                                        fontSize: '0.85rem',
                                        color: '#334155',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={Boolean(search.set[setName])}
                                        onChange={() => dispatch(SearchActions.checkSet(setName))}
                                    />
                                    {setName}
                                </label>
                            ))}
                        </div>
                    )}

                    {/* (C) ★ D&D 정렬 기준 우선순위 설정 바 ★ */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, minWidth: '85px' }}>
                                정렬 우선순위:
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                (좌우 드래그로 순서 변경)
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                            {orders.map((order, index) => {
                                const isSortActive = Boolean(search.sort[order.sorting]?.active);
                                const isAsc = Boolean(search.sort[order.sorting]?.asc);
                                return (
                                    <div
                                        key={order.name}
                                        draggable
                                        onDragStart={() => onDragStart(index)}
                                        onDragEnter={() => onDragEnter(index)}
                                        onDragEnd={onDrop}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.35rem',
                                            padding: '0.35rem 0.6rem',
                                            borderRadius: '6px',
                                            border: '1px solid',
                                            borderColor: isSortActive ? '#2563eb' : '#cbd5e1',
                                            background: isSortActive ? '#f0f7ff' : '#f8fafc',
                                            cursor: 'grab',
                                            userSelect: 'none',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                        }}
                                        title="마우스로 끌어서 정렬 우선순위를 변경하세요"
                                    >
                                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>⠿</span>
                                        <span
                                            style={{
                                                fontSize: '0.7rem',
                                                background: isSortActive ? '#2563eb' : '#94a3b8',
                                                color: '#ffffff',
                                                padding: '1px 5px',
                                                borderRadius: '10px',
                                                fontWeight: 700,
                                            }}
                                        >
                                            {index + 1}순위
                                        </span>
                                        <input
                                            type="checkbox"
                                            checked={isSortActive}
                                            onChange={() => dispatch(SearchActions.checkSort(order.sorting))}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                                            {order.name}
                                        </span>

                                        {isSortActive && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', marginLeft: '0.2rem' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (!isAsc) dispatch(SearchActions.checkAsc(order.sorting));
                                                    }}
                                                    style={{
                                                        padding: '1px 4px',
                                                        fontSize: '0.75rem',
                                                        border: '1px solid',
                                                        borderColor: isAsc ? '#2563eb' : '#cbd5e1',
                                                        background: isAsc ? '#2563eb' : '#ffffff',
                                                        color: isAsc ? '#ffffff' : '#64748b',
                                                        borderRadius: '3px',
                                                        cursor: 'pointer',
                                                        fontWeight: 600,
                                                    }}
                                                    title="오름차순"
                                                >
                                                    오름 ⬆
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (isAsc) dispatch(SearchActions.checkAsc(order.sorting));
                                                    }}
                                                    style={{
                                                        padding: '1px 4px',
                                                        fontSize: '0.75rem',
                                                        border: '1px solid',
                                                        borderColor: !isAsc ? '#2563eb' : '#cbd5e1',
                                                        background: !isAsc ? '#2563eb' : '#ffffff',
                                                        color: !isAsc ? '#ffffff' : '#64748b',
                                                        borderRadius: '3px',
                                                        cursor: 'pointer',
                                                        fontWeight: 600,
                                                    }}
                                                    title="내림차순"
                                                >
                                                    내림 ⬇
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItemFilterToolbar;
