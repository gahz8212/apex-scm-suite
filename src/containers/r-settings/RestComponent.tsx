import React, { useState } from 'react';
import CardComponent from '../common/card/CardComponent';
import ItemFilterDrawer from '../search/ItemFilterDrawer';
import { useSelector } from 'react-redux';
import { SearchData } from '../../store/slices/searchSlice';

type Props = {
    items: {
        id: number;
        type: string;
        category: string;
        itemName: string;
        descript: string;
        unit: string;
        im_price: number;
        sum_im_price: number;
        ex_price: number;
        use: boolean;
        supplyer: string;
        Images: { url: string }[];
        Good: { groupName: string };
        left: number;
        top: number;
        point: number;
    }[] | null;
    selectItem: (id: number) => void;
    dragItem: (id: number) => void;
    onDrop: () => void;
    viewMode: boolean;
    relations: { UpperId: number; LowerId: number; }[] | null;
    totalPrice: { [key: number]: number } | undefined;
};

const RestComponent: React.FC<Props> = ({ items, selectItem, dragItem, onDrop, viewMode, relations, totalPrice }) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { search } = useSelector(SearchData);
    const sourceItems = search.filteredItems !== null ? search.filteredItems : items;

    const hasActiveFilters = Boolean(
        !search.all.typeALL ||
        !search.all.setALL ||
        !search.all.groupALL ||
        (search.sort && Object.values(search.sort).some((s: any) => s.active))
    );

    if (sourceItems) {
        let parts;
        if (viewMode) {
            parts = sourceItems;
        } else {
            parts = sourceItems.filter(item => item.type !== 'SET');
        }
        return (
            <div className="right">
                {/* 상단 우측 정렬된 검색 토글 버튼 */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginBottom: '0.75rem' }}>
                    <button
                        type="button"
                        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            padding: '0.45rem 0.95rem',
                            borderRadius: '6px',
                            border: '1px solid',
                            borderColor: isDrawerOpen ? '#2563eb' : '#cbd5e1',
                            background: isDrawerOpen ? '#eff6ff' : '#ffffff',
                            color: isDrawerOpen ? '#2563eb' : '#334155',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                            transition: 'all 0.2s',
                        }}
                    >
                        <span>🔍</span>
                        <span>{isDrawerOpen ? '부품 검색창 닫기' : '하위 부품 검색 & 정렬 필터'}</span>
                        {hasActiveFilters && (
                            <span
                                style={{
                                    fontSize: '0.7rem',
                                    background: '#2563eb',
                                    color: '#ffffff',
                                    padding: '1px 6px',
                                    borderRadius: '10px',
                                    fontWeight: 700,
                                }}
                            >
                                적용중
                            </span>
                        )}
                    </button>
                </div>

                {/* 오른쪽 끝에서 슥 하고 나타나는 슬라이드 필터 드로어 */}
                <ItemFilterDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    hideSetFilter={!viewMode}
                    placeholder="하위 부품명 또는 규격 검색..."
                    title="BOM 부품 검색 & 정렬 필터"
                />

                <div className="cards">
                    <CardComponent
                        items={parts}
                        selectItem={selectItem}
                        relations={relations}
                        showRelate={() => undefined}
                        dragItem={dragItem}
                        onDrop={onDrop}
                        viewMode={viewMode}
                        totalPrice={totalPrice}
                    />
                </div>
            </div>
        );
    } else {
        return null;
    }
};

export default RestComponent;