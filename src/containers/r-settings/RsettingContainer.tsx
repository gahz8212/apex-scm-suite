import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { itemData, itemActions } from '../../store/slices/itemSlice';
import { relateData, relateActions } from '../../store/slices/relationSlice'
import { editActions, editData } from '../../store/slices/editSlice';
import { formSelector, formActions } from '../../store/slices/formSlice';
import RsettingComponent from './RsettingComponent';
import { makeRelateData_View, makeRelateData_Price } from '../../lib/utils/createRelateData'
import { changeRelationToDragItems, returnTotalPrice } from '../../lib/utils/returnTotalPrice';

const RsettingContainer = () => {
    const dispatch = useDispatch();
    const { items, dragItems: dragItems_item, dragItem: dragedItem, relations, backup } = useSelector(itemData)
    const { input, edit, relate } = useSelector(formSelector)
    const { status, dragItems: dragItems_edit } = useSelector(editData);
    const { relate_view, totalPrice, selectedItem, viewMode } = useSelector(relateData);
    const [selectedGoodId, setSelectedGoodId] = useState<number>(-1)
    const [openBasket, setOpenBasket] = useState(false)
    const openAddForm = () => {
        dispatch(formActions.toggle_form({ form: 'input', value: !input.visible }))
    }
    const changePosition = (form: string, position: { x: number, y: number }) => {
        dispatch(formActions.changePosition({ form, position }))
    }
    const selectItem = (id: number | '') => {

        const newItems = relations?.filter(relation => relation.UpperId === id)
            .map(relation => relation.LowerId)
            .map(id => viewMode ? backup?.filter(item => item.id === id) : items?.filter(item => item.id === id))
            .flat()
            .map((arr => {
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
            if (typeof id === 'number') {
                const result = makeRelateData_View(id, relations, items)
                if (result) {
                    if (!openBasket)
                        dispatch(relateActions.insertRelation_view(result))
                }
            }
            dispatch(editActions.selectItem(item[0]));
            dispatch(formActions.toggle_form({ form: 'edit', value: true }))
        }
    }
    const viewRelation = (toggle: boolean) => {
        dispatch(formActions.toggle_form({ form: 'relate', value: toggle }))
    }
    const dragItem = (id: number | '') => {
        if (items) {
            const item = items.filter(item => item.id === id).map(item => (
                {
                    id: item.id,
                    type: item.type,
                    category: item.category,
                    itemName: item.itemName,
                    unit: item.unit,
                    im_price: item.im_price,
                    point: 0,
                    // desript: item.descript,
                    // use: item.use,
                }
            ));
            dispatch(itemActions.inputDragItem(item[0]))
            dispatch(editActions.inputDragItem(item[0]))
        }
    }
    const onDrop = () => {
        dispatch(itemActions.initialDragItem())
        dispatch(editActions.initialDragItem())
    }
    const drag_on = (targetId: number, itemId: number) => {
        if ((dragItems_item.filter(dragItem_edit => dragItem_edit.id === itemId && dragItem_edit.targetId === targetId).length === 0) && itemId !== targetId)
            dispatch(itemActions.drag_on(targetId))
    }
    const addCount = (targetId: number | string | boolean, itemId: number | string | boolean) => {

        let idx = dragItems_item.findIndex(dragItem_item => dragItem_item.id === itemId && dragItem_item.targetId === targetId)
        if (typeof targetId === 'number' && typeof itemId === 'number') {
            dispatch(itemActions.addCount({ idx, targetId }))
            if (items && viewMode) {
                let idx = items.findIndex(item => item.id === itemId && item.upperId === targetId)
                let idx_drag = dragItems_edit?.findIndex(dragItem_edit => dragItem_edit.id === itemId)
                dispatch(itemActions.addCount_relate(idx))
                dispatch(relateActions.addCountRelateView(itemId))
                dispatch(editActions.addCount({ idx: idx_drag }))
            }
        }
    }
    const removeCount = (targetId: number | string | boolean, itemId: number | string | boolean, mode: string) => {
        let idx = dragItems_item.findIndex(dragItem_item => dragItem_item.targetId === targetId && dragItem_item.id === itemId)
        if (typeof targetId === 'number' && typeof itemId === 'number') {
            dispatch(itemActions.removeCount({ idx, targetId, mode }))
            if (items && viewMode) {
                let idx = items.findIndex(item => item.id === itemId && item.upperId === targetId)
                let idx_drag = dragItems_edit?.findIndex(dragItem_edit => dragItem_edit.id === itemId)
                // console.log('idx_drag', idx_drag)
                dispatch(itemActions.removeCount_relate({ idx, viewMode }))
                dispatch(editActions.removeCount({ idx: idx_drag }))
                if (items[idx].point === 0)
                    dispatch(relateActions.removeCountRelateView(itemId))
            }
        }
    }
    const addRelations = (id: number) => {

        const createdRelations = dragItems_item?.filter(dragItem_item => dragItem_item.targetId === id)
            .map(dragItem => ({ UpperId: dragItem.targetId, LowerId: dragItem.id, point: dragItem.point }));
        // console.log('createRelations', createdRelations)
        // 현재 그룹창에 있는 새로운 dragItems를 relation 형식으로 변환
        // console.log('dragedItem', dragItem)
        if (createdRelations) {
            const newRelations =
                relations?.filter(relation => relation.UpperId !== id)
            // 실제 relations에서 변환된 dragItems가 아닌것만 남긴 relations     
            // console.log('createdRelations', createdRelations)
            // console.log('newRelations', newRelations)
            if (createdRelations && newRelations && items) {
                const newCreateRelations = [...createdRelations, ...newRelations]
                const newArray = changeRelationToDragItems(items, newCreateRelations)
                if (relations) {
                    const totalPrice = returnTotalPrice(items, newCreateRelations, newArray);
                    // console.log('totalPrice', totalPrice)
                    dispatch(relateActions.calculateTotalPrice(totalPrice))
                }
                dispatch(itemActions.updateRelation(newCreateRelations)
                    //  변환된 dragItems가 없는 relations에 새로운 dragItems 주입
                )
            }
        }
    }
    const inputDragItems_edit = (id: number) => {

        // const newItems = relations?.filter(relation => relation.UpperId === id)
        //     .map(relation => relation.LowerId)
        //     .map(id => items?.filter(item => item.id === id)).flat().map((arr => {
        //         if (arr) {
        //             const point = relations.filter(relation => relation.UpperId === id && relation.LowerId === arr.id).map(relation => relation.point)[0];
        //             return ({
        //                 id: arr.id, type: arr.type, category: arr.category, point: point,
        //                 im_price: arr.im_price, itemName: arr.itemName, targetId: id, unit: arr.unit

        //             })
        //         } else {
        //             return null
        //         }
        //     })
        //     )
        // dispatch(editActions.inputDragItems(newItems))
    }
    const insertRelation_view = (selectedItem: number) => {
        // alert(selectedItem)
        if (items) {
            items.filter(item => item.id === selectedItem);
            // console.log('relations', relations)
            if (typeof selectedItem === 'number') {
                const result = makeRelateData_View(selectedItem, relations, items)
                // console.log('result', result)
                if (result) {
                    dispatch(relateActions.insertRelation_view(result))
                }
            }
        }
    }
    const addRelateGood = (
        item: {
            [key: string]: number | string | {}[]
        },
    ) => {
        // console.log('item', item)
        dispatch(editActions.editItem(item))
        // console.log('item.dragItems', item.dragItems)
        //items의 point를 item.dragItems의 포인트로 변경

        if (typeof item.id === 'number') {
            addRelations(item.id)
            setSelectedGoodId(item.id)
            // console.log(item.id)
            // insertRelation_view(item.id)
        }
    }
    const changeView = (toggle: boolean) => {
        // insertRelation_view(itemId)
        setViewMode(toggle)
        if (toggle) {
            let newItem: {}[] = [];
            relate_view?.map(view => items?.map(item => {
                if (item.id === view.currentId) {
                    newItem.push({
                        ...item,
                        top: view.top,
                        left: view.left,
                        sum_im_price: view.sum_im_price,
                        point: view.point,
                        upperId: view.upperId
                    })
                    // console.log('newItem', newItem)
                    return newItem;
                } else { return null }
            }
            ))
            dispatch(itemActions.viewMatrix(newItem))
        } else {
            dispatch(itemActions.backupItems())
        }
    }
    const setSelectedItemId = (id: number | null) => {
        if (typeof id === 'number') {
            dispatch(relateActions.setSelectedItemId(id))
        }
    }
    const setViewMode = (mode: boolean) => {
        dispatch(relateActions.setViewMode(mode))
    }
    useEffect(() => {
        dispatch(itemActions.initForm())
        dispatch(editActions.initForm())
        dispatch(itemActions.getItem())
        dispatch(relateActions.initRelate())
    }, [dispatch])

    useEffect(() => {
        let newArray: { [key: string]: number | string }[] = [];
        relations?.filter(relation => items?.filter(item => {
            if (relation.LowerId === item.id) {
                newArray.push({
                    id: relation.LowerId, point: relation.point, targetId: relation.UpperId,
                    itemName: item.itemName, type: item.type, category: item.category, im_price: item.im_price
                })
                return newArray;
            } else { return null }
        }))

        dispatch(itemActions.inputDragItems(newArray))
    }, [])
    useEffect(() => {
        if (selectedItem) {
            insertRelation_view(selectedItem)
        }
    }, [selectedItem, relations])
    useEffect(() => {
        if (status.message === 'good_ok') {
            if (items) {
                const result = makeRelateData_View(selectedGoodId, relations, items)
                if (result) {
                    dispatch(relateActions.insertRelation_view(result))
                }
            }
        }
    }, [dispatch, status.message, selectedGoodId, items, relations])

    //아래 코드는 전체 아이템중에 하위아이템이 있는 SET의 최종 합산가격입니다.
    //아래 코드가 없다면 선택된 SET만 최종 합산가격을 표시합니다. 
    //아래 코드가 있어야 선택된 SET를 포함하여 모든 SET의 최종 합산가격을 표시하지만
    //
    useEffect(() => {
        if (dragItems_item) {
            const result = dragItems_item.reduce((acc: { [key: number]: number }, curr) => {
                if (curr.type === 'SET' || curr.type === 'ASSY') {
                    if (items) {
                        const view = makeRelateData_Price(curr.id, relations, items)
                        const price = view[0].sum_im_price * curr.point;
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
            // console.log('result', result)
            dispatch(relateActions.calculateTotalPrice(result))
        }
    }, [dragItems_item, dispatch, items, relations])

    useEffect(() => {
        return () => {
            localStorage.removeItem('scrollPosition')
        }
    }, [])


    return (
        <RsettingComponent items={items} selectItem={selectItem} onDrop={onDrop} dragItem={dragItem} dragItems={dragItems_item}
            input={input} edit={edit} openAddForm={openAddForm} changePosition={changePosition}
            drag_on={drag_on} addCount={addCount} removeCount={removeCount} dragedItem={dragedItem} relate={relate}
            viewRelation={viewRelation} relations={relations} relate_view={relate_view} addRelateGood={addRelateGood}
            changeView={changeView} viewMode={viewMode} setOpenBasket={setOpenBasket}
            totalPrice={totalPrice}
            insertRelation_view={insertRelation_view} setSelectedItemId={setSelectedItemId}
            setViewMode={setViewMode}
            inputDragItems_edit={inputDragItems_edit} />
    );
};

export default RsettingContainer;