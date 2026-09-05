import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SearchActions, SearchData } from '../../store/slices/searchSlice';
import { itemData } from '../../store/slices/itemSlice';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    hideSetFilter?: boolean;
    placeholder?: string;
    title?: string;
};

const ItemFilterDrawer: React.FC<Props> = ({
    isOpen,
    onClose,
    hideSetFilter = false,
    placeholder = '품목명 또는 규격 검색...',
    title = '품목 검색 & 정렬 필터',
}) => {
    const dispatch = useDispatch();
    const { search } = useSelector(SearchData);
    const { items } = useSelector(itemData);

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

    // 3. 타입/카테고리 전체 체크 동기화
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
                search.group.회로 &&
                search.group.전장 &&
                search.group.기구 &&
                search.group.포장 &&
                search.group.기타
            ) {
                dispatch(SearchActions.groupCheckAll(true));
            } else {
                dispatch(SearchActions.groupCheckAll(false));
            }
        }
    }, [dispatch, search.type, search.set, search.group]);

    // 4. 필터 초기화 핸들러
    const handleReset = () => {
        setSearchText('');
        dispatch(SearchActions.initState());
        setOrders([
            { name: '타입', sorting: 'type' },
            { name: '분류', sorting: 'category' },
            { name: '이름', sorting: 'itemName' },
            { name: '생성일', sorting: 'createdAt' },
        ]);
    };

    return (
        <>
            {/* 반투명 백드롭 오버레이 (클릭 시 닫기) */}
            <div
                className={`filter-drawer-backdrop ${isOpen ? 'open' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* 슬라이드 패널 (오른쪽 끝에서 슥 하고 나타남) */}
            <aside
                className={`filter-drawer-panel ${isOpen ? 'open' : ''}`}
                aria-label="품목 검색 및 정렬 필터 드로어"
            >
                {/* 1. 드로어 헤더 */}
                <div className="drawer-header">
                    <div className="drawer-title-area">
                        <span className="icon">🔍</span>
                        <h3>{title}</h3>
                    </div>
                    <div className="drawer-header-actions">
                        <button
                            type="button"
                            className="btn-reset"
                            onClick={handleReset}
                            title="모든 검색어 및 필터 조건을 초기화합니다"
                        >
                            🔄 초기화
                        </button>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            title="검색 패널 닫기"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* 2. 드로어 본문 (스크롤 가능) */}
                <div className="drawer-body">
                    {/* (1) 실시간 검색어 입력 */}
                    <div>
                        <div className="section-title">
                            <span className="label">실시간 키워드 검색</span>
                            <span className="hint">부품명, 규격, 코드</span>
                        </div>
                        <div className="search-box-wrapper">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                placeholder={placeholder}
                            />
                            {searchText && (
                                <button
                                    type="button"
                                    className="btn-clear"
                                    onClick={() => setSearchText('')}
                                    title="검색어 지우기"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {/* (2) 품목 타입 칩 */}
                    <div>
                        <div className="section-title">
                            <span className="label">품목 타입 선택</span>
                        </div>
                        <div className="type-chips">
                            <button
                                type="button"
                                className={`chip ${search.all.typeALL ? 'active' : ''}`}
                                onClick={() => dispatch(SearchActions.typeALL(!search.all.typeALL))}
                            >
                                ALL (전체)
                            </button>
                            {!hideSetFilter && (
                                <button
                                    type="button"
                                    className={`chip ${search.type.SET ? 'active' : ''}`}
                                    onClick={() => dispatch(SearchActions.checkType('SET'))}
                                >
                                    SET (완성품)
                                </button>
                            )}
                            <button
                                type="button"
                                className={`chip assy ${search.type.ASSY ? 'active' : ''}`}
                                onClick={() => dispatch(SearchActions.checkType('ASSY'))}
                            >
                                ASSY (조립품)
                            </button>
                            <button
                                type="button"
                                className={`chip parts ${search.type.PARTS ? 'active' : ''}`}
                                onClick={() => dispatch(SearchActions.checkType('PARTS'))}
                            >
                                PARTS (자재)
                            </button>
                        </div>
                    </div>

                    {/* (3) 4단계 D&D 복합 정렬 우선순위 */}
                    <div>
                        <div className="section-title">
                            <span className="label">정렬 우선순위 (D&D)</span>
                            <span className="hint">카드를 끌어서 순위 변경</span>
                        </div>
                        <div className="sort-dnd-list">
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
                                        className={`sort-item ${isSortActive ? 'active' : ''}`}
                                        title="위아래로 끌어서 정렬 우선순위를 변경하세요"
                                    >
                                        <div className="sort-left">
                                            <span className="handle">⠿</span>
                                            <span className={`rank-badge rank-${index + 1}`}>
                                                {index + 1}순위
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={isSortActive}
                                                onChange={() => dispatch(SearchActions.checkSort(order.sorting))}
                                            />
                                            <span className="name">{order.name}</span>
                                        </div>

                                        {isSortActive && (
                                            <div className="sort-right">
                                                <button
                                                    type="button"
                                                    className={isAsc ? 'selected' : ''}
                                                    onClick={() => {
                                                        if (!isAsc) dispatch(SearchActions.checkAsc(order.sorting));
                                                    }}
                                                    title="오름차순"
                                                >
                                                    오름 ⬆
                                                </button>
                                                <button
                                                    type="button"
                                                    className={!isAsc ? 'selected' : ''}
                                                    onClick={() => {
                                                        if (isAsc) dispatch(SearchActions.checkAsc(order.sorting));
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

                    {/* (4) 자재 분류 (회로, 전장, 기구, 포장, 기타) */}
                    <div>
                        <div className="section-title">
                            <span className="label">자재 세부 분류</span>
                        </div>
                        <div className="checkbox-grid">
                            <label className="all-label">
                                <input
                                    type="checkbox"
                                    checked={Boolean(search.all.groupALL)}
                                    onChange={(e) => dispatch(SearchActions.groupALL(e.target.checked))}
                                />
                                전체
                            </label>
                            {['회로', '전장', '기구', '포장', '기타'].map((groupName) => (
                                <label key={groupName}>
                                    <input
                                        type="checkbox"
                                        checked={Boolean(search.group[groupName])}
                                        onChange={() => dispatch(SearchActions.checkGroup(groupName))}
                                    />
                                    {groupName}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* (5) 완성품 분류 (SET 카테고리) */}
                    {!hideSetFilter && (
                        <div>
                            <div className="section-title">
                                <span className="label">완성품 모델 분류</span>
                            </div>
                            <div className="checkbox-grid">
                                <label className="all-label">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(search.all.setALL)}
                                        onChange={(e) => dispatch(SearchActions.setALL(e.target.checked))}
                                    />
                                    전체
                                </label>
                                {['EDT', 'NOBARK', 'RDT', 'LAUNCHER', '기타'].map((setName) => (
                                    <label key={setName}>
                                        <input
                                            type="checkbox"
                                            checked={Boolean(search.set[setName])}
                                            onChange={() => dispatch(SearchActions.checkSet(setName))}
                                        />
                                        {setName}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. 드로어 하단 닫기 액션 바 */}
                <div className="drawer-footer">
                    <button
                        type="button"
                        className="btn-apply-close"
                        onClick={onClose}
                    >
                        닫기 (필터 적용 완료)
                    </button>
                </div>
            </aside>
        </>
    );
};

export default ItemFilterDrawer;
