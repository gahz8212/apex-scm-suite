import React from 'react';
import CardComponent from '../common/card/CardComponent';
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
        Images: { url: string }[],
        Good: { groupName: string },
        left: number,
        top: number,
        point: number
        // visible: boolean

    }[] | null;
    selectItem: (id: number) => void;
    dragItem: (id: number) => void;
    onDrop: () => void;
    viewMode: boolean;
    relations: { UpperId: number; LowerId: number; }[] | null;
    totalPrice: { [key: number]: number } | undefined;


}
const RestComponent: React.FC<Props> = ({ items, selectItem, dragItem, onDrop, viewMode, relations, totalPrice }) => {
    if (items) {
        let parts;
        if (viewMode) {
            parts = items
        } else {
            parts = items.filter(item => item.type !== 'SET')
        }
        return (

            <div className="right">
                <div className="cards">
                    <CardComponent items={parts} selectItem={selectItem} relations={relations} showRelate={() => undefined}
                        dragItem={dragItem}
                        onDrop={onDrop} viewMode={viewMode}
                        totalPrice={totalPrice} />
                </div>
            </div>

        );
    } else
        return null
};

export default RestComponent;