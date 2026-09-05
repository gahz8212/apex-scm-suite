import React, { useState, useEffect } from 'react';
import CardComponent from './CardComponent';
import { useSelector, useDispatch } from 'react-redux'
import { itemActions, itemData } from '../../../store/slices/itemSlice';
import { relateData, relateActions } from '../../../store/slices/relationSlice'
import { editActions } from '../../../store/slices/editSlice';
import { formSelector, formActions } from '../../../store/slices/formSlice';
import { makeRelateData_View, makeRelateData_View_Horizon } from '../../../lib/utils/createRelateData'
import { SearchActions, SearchData } from '../../../store/slices/searchSlice';
const CardContainer = () => {
    const dispatch = useDispatch();
    const { items, status, relations } = useSelector(itemData);
    const { search } = useSelector(SearchData);
    const { totalPrice } = useSelector(relateData)



    const selectItem = (id: number | '') => {
       
        const newItems = relations?.filter(relation => relation.UpperId === id)
            .map(relation => relation.LowerId)
            .map(id => items?.filter(item => item.id === id)).flat().map((arr => {
                if (arr) {
                    const point = relations.filter(relation => relation.UpperId === id && relation.LowerId === arr.id).map(relation => relation.point)[0];
                    return ({
                        id: arr.id, type: arr.type, category: arr.category, point: point,
                        im_price: arr.im_price, itemName: arr.itemName, targetId: id, unit: arr.unit

                    })
                } else {
                    return null
                }
            })
            )
        // console.log('newItems', newItems)
        dispatch(editActions.inputDragItems(newItems))
        if (items) {
            const item = items.filter(item => item.id === id);
            dispatch(editActions.selectItem(item[0]));
            dispatch(formActions.toggle_form({ form: 'edit', value: true }))
        }
    }
    const showRelate = (id: number, type: string, event: any, visible: boolean) => {
        if (items) {
            if (typeof id === 'number' && type !== 'PARTS') {
                const result = makeRelateData_View_Horizon(id, relations, items)
                console.log('result', result)
                if (result) {
                    dispatch(relateActions.insertRelation_view_horizon(result))
                }
                dispatch(formActions.toggle_form({ form: 'relate', value: visible }))
                dispatch(formActions.changePosition({
                    form: 'relate',
                    position: {
                        x:
                            event.clientX >= 1200 ? event.clientX - 220 : event.clientX <= 200 ? event.clientX + 80 : event.clientX,
                        y: event.clientY
                    }
                }))
            }
        }
    }
    const dragItem = (id: number | '') => {
        const item = items?.filter(item => item.id === id).map(item => (
            {
                id: item.id,
                type: item.type,
                category: item.category,
                itemName: item.itemName,
                unit: item.unit,
                im_price: item.im_price,
                sum_im_price: item.sum_im_price,
                point: 0
                // desript: item.descript,
                // use: item.use,
            }
        ));
        if (item) {
            dispatch(itemActions.inputDragItem(item[0]))
            dispatch(editActions.inputDragItem(item[0]))
        }
    }
    const onDrop = () => {
        dispatch(itemActions.initialDragItem())
        dispatch(editActions.initialDragItem())
    }

    return (
        <div>
            <CardComponent
                items={search.filteredItems}
                selectItem={selectItem}
                dragItem={dragItem}
                onDrop={onDrop}
                viewMode={false}
                relations={relations}
                showRelate={showRelate}
                totalPrice={totalPrice}

            />
        </div>
    );
};

export default CardContainer;