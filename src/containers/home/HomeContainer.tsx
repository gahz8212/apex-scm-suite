import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { itemData, itemActions } from '../../store/slices/itemSlice';
import { relateActions } from '../../store/slices/relationSlice'
import { editActions } from '../../store/slices/editSlice';
import { currencyActions, currencyData } from '../../store/slices/currencySlice';
import { makeRelateData_Price } from '../../lib/utils/createRelateData'

import HomeComponent from './HomeComponent';




const HomeContainer = () => {
    const dispatch = useDispatch();
    const { items, dragItems, relations } = useSelector(itemData)
    const { fromCurrency, resultCurrency } = useSelector(currencyData)


    const searchCurrency = () => {
        // alert('search')
        dispatch(currencyActions.searchCurrency())
    }


    useEffect(() => {
        dispatch(itemActions.initForm())
        dispatch(editActions.initForm())
        dispatch(itemActions.getItem())
        dispatch(relateActions.initRelate())
        dispatch(currencyActions.searchCurrency())
    }, [dispatch])

    useEffect(() => {
        if (!relations || !items) return;
        const itemMap = new Map(items.map(item => [item.id, item]));
        const newArray: { [key: string]: number | string }[] = [];
        relations.forEach(relation => {
            const item = itemMap.get(relation.LowerId);
            if (item) {
                newArray.push({
                    id: relation.LowerId,
                    point: relation.point,
                    targetId: relation.UpperId,
                    itemName: item.itemName,
                    type: item.type,
                    category: item.category,
                    im_price: item.im_price
                });
            }
        });

        dispatch(itemActions.inputDragItems(newArray));
    }, [relations, items, dispatch])

    useEffect(() => {
        if (dragItems) {
            const result = dragItems.reduce((acc: { [key: number]: number }, curr) => {
                if (curr.type === 'SET' || curr.type === 'ASSY') {
                    if (items) {
                        const view = makeRelateData_Price(curr.id, relations, items)
                        const price = (view && view[0] ? view[0].sum_im_price : 0) * curr.point;
                        if (acc[curr.targetId]) {
                            acc[curr.targetId] = price + acc[curr.targetId]
                        } else {
                            acc[curr.targetId] = price
                        }
                    }
                } else {
                    if (acc[curr.targetId]) {
                        acc[curr.targetId] += curr.im_price * curr.point
                    } else {
                        acc[curr.targetId] = curr.im_price * curr.point
                    }
                }
                return acc;
            }, {})
            dispatch(relateActions.calculateTotalPrice(result))
        }
    }, [dragItems, dispatch, items, relations])
    return (
        <HomeComponent
            fromCurrency={fromCurrency}
            searchCurrency={searchCurrency}
            resultCurrency={resultCurrency}
        // list={orders}

        />
    );
};
export default HomeContainer;