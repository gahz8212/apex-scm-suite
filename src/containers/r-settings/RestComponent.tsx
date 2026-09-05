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

    if (sourceItems) {
        let parts;
        if (viewMode) {
            parts = sourceItems;
        } else {
            parts = sourceItems.filter(item => item.type !== 'SET');
        }
        return (
            <div className="right">
                {/* 오른쪽 끝에 붙은 탭 버튼 & 슬라이드 드로어 */}
                <ItemFilterDrawer
                    isOpen={isDrawerOpen}
                    onToggle={() => setIsDrawerOpen(!isDrawerOpen)}
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