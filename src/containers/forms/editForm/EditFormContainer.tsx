import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { editActions, editData } from '../../../store/slices/editSlice';
import { itemActions, itemData } from '../../../store/slices/itemSlice';
import { formSelector, formActions } from '../../../store/slices/formSlice';
import { relateData } from '../../../store/slices/relationSlice';
import { imageInsert } from '../../../lib/utils/createFormData'
import EditFormComponent from './EditFormComponent';
import { makeRelateData_Price } from '../../../lib/utils/createRelateData'
import { makeRelateData_View } from '../../../lib/utils/createRelateData copy'
import { changeRelationToDragItems, returnTotalPrice } from '../../../lib/utils/returnTotalPrice';
import { relateActions } from '../../../store/slices/relationSlice';
const EditFormContainer = () => {
    const dispatch = useDispatch();
    const { prev, next, status } = useSelector(editData)
    const { items, relations, backup: backups, dragItems: dragItems_item } = useSelector(itemData)
    const { dragItems: dragItems_edit, dragItem: dragedItem } = useSelector(editData)
    const { viewMode } = useSelector(relateData)
    const [totalPrice, setTotalPrice] = useState(0)
    const [goodType, setGoodType] = useState<{
        category: string, type: string,
    }[]>([])
    const [supplyer, setSupplyer] = useState<string[]>([])

    const onChange = (e: any) => {
        let { name, value } = e.target;
        // console.log(value)
        if (name === 'use' || name === 'set') {
            value = value === '1' ? true : false
        }
        dispatch(editActions.changeField({ name, value }))
    }
    const editImage = async (e: any) => {
        const formData = imageInsert(e, next.Images)
        dispatch(editActions.editImage(await formData))
    }
    const editItem = (
        item: {
            [key: string]: number | string | { url: string }[] | boolean | {}[]
        },
    ) => {
        dispatch(editActions.editItem(item))
        dispatch(itemActions.updatePicked(item))
    }
    const removeItem = (id: number | '') => {
        if (relations?.findIndex(relation => relation.LowerId === id) === -1) {
            dispatch(editActions.removeItem(id))
        } else {
            alert('연결되어 있는 아이템이 있으면 삭제되지 않습니다.')

        }
    }
    const removeImage = (id: number | '', url: string) => {
        const newNextImage = next.Images.filter(image => image.url !== url)
        dispatch(editActions.removeImage(newNextImage))
    }
    const closeForm = () => {
        dispatch(editActions.initForm())
        dispatch(formActions.toggle_form({ form: 'edit', value: false }))
    }
    const results = items?.filter((item: any) => item.groupType !== null).map((item: any) => {
        return ({ category: item.category, type: item.groupType })
    })
    results?.forEach((result) => {
        const json_arr = goodType.map((ar: any) => JSON.stringify(ar))
        if (!json_arr.includes(JSON.stringify(result))) {
            setGoodType([result, ...goodType].sort())
        }
    })
    const insertGroupType = () => {
        if (next.new_groupType.toString()) {
            setGoodType([{ category: next.category.toString(), type: next.new_groupType.toString() }, ...goodType])
            dispatch(editActions.changeField({ name: 'groupType', value: next.new_groupType }))
        }
    }
    const insertSupplyer = () => {
        if (next.new_supplyer.toString()) {
            setSupplyer([next.new_supplyer.toString(), ...supplyer].sort())
            dispatch(editActions.changeField({ name: 'supplyer', value: next.new_supplyer }))
        }
    }

    const drag_on = (targetId: number, itemId: number) => {

        if ((dragItems_edit?.filter(dragItem => dragItem.id === itemId && dragItem.targetId === targetId).length === 0) && targetId !== itemId) {
            dispatch(editActions.drag_on(targetId))
            dispatch(itemActions.drag_on(targetId))
        }
    }
    const drag_on_relation = (targetId: number, itemId: number) => {
        // console.log('editForm', targetId, itemId)
        if ((dragItems_edit?.filter(dragItem_edit => dragItem_edit.id === itemId && dragItem_edit.targetId === targetId).length === 0) && targetId !== itemId) {
            dispatch(editActions.drag_on(targetId))
        }
        let currItemIndex = items?.findIndex(item => item.id === itemId)
        let upperItemIndex = items?.findIndex(item => item.id === targetId)
        let top = 0;
        let left = 0;
        if (items && currItemIndex && upperItemIndex && backups) {
            let type = items[currItemIndex].type;
            let childrenLength = items.filter(item => item.upperId === targetId).length + 1
            // console.log('childrenLength', childrenLength)
            let position = { top: items[upperItemIndex].top, left: items[upperItemIndex].left }
            if (type === 'PARTS') {
                top = position.top;
                left = (position.left) * childrenLength + 65///*상위아이템의 자식아이템 갯수 _를 구해서 곱해줘야 한다.
            } else {
                top = position.top + 110;
                left = position.left + 110

            }

            const lists = makeRelateData_View(itemId, relations, backups, top, left);
            const newItems: {}[] = [];
            // console.log('lists', lists)
            lists.forEach(list => items.forEach(item => {
                if (item.id === list.currentId) {
                    // newItems.push(item)
                    newItems.push({ ...item, ...list, ...{ point: 0 }, ...{ upperId: targetId } })
                }
            }))
            newItems.map(newItem => dispatch(itemActions.addItems(newItem)))
            // dispatch(relateActions.insertRelation_view(newItems))
            // 
        }
    }





    //edit폼 내부의 dragItem의 수량을 변경시키면 editSlice의 dragItems뿐만 아니라
    //itemSlice의 dragItems도 변경시켜야 한다.
    //그러면 viewMode(true)화면에서도 그 변화를 시각적으로 표현이 가능하다.
    //그러나 복수의 item이 표시되어 있을 경우에 어떤 아이템을 선택해야 할지 알 수 없으므로
    //UpperId의 속성이 있으면 선택이 가능해 진다.
    //하지만 UpperId 속성은 연결상태에 따라 계속 변경되므로 화면에 보여지기 직전에 기록이 되어야 한다.
    //매개변수로 받은 trgetId를 이용하면 정확한 idx를 받아낼 수 있다.
    //dragItems가 종류가 많으므로
    //dragItems_item:item, dragItems:edit 등으로 분류한다.


    const addCount = (targetId: number | string | boolean, itemId: number | string | boolean) => {
        let idx = dragItems_edit?.findIndex(dragItem_edit => dragItem_edit.id === itemId && dragItem_edit.targetId === targetId)
        if (typeof targetId === 'number' && typeof itemId === 'number' && items) {
            dispatch(editActions.addCount({ idx, targetId }))
            const price = makeRelateData_Price(targetId, relations, items)[0].sum_im_price
            setTotalPrice(price)
            // console.log('id:', targetId, 'price:', price)
            let idx_item = viewMode ?
                items.findIndex(item => item.id === itemId && item.upperId === targetId)
                : items.findIndex(item => item.id === itemId)//viewMode가 아닐경우에는 items에 upperId가 없다.
            let idx_item_drag = dragItems_item?.findIndex(dragItem_item => dragItem_item.id === itemId)
            // console.log('idx_item_drag', idx_item_drag)
            dispatch(itemActions.addCount({ idx: idx_item_drag }))
            dispatch(itemActions.addCount_relate(idx_item))
        }
    }

    const removeCount = (targetId: number | string | boolean, itemId: number | string | boolean,mode:string) => {
        let idx = dragItems_edit?.findIndex(item => item.targetId === targetId && item.id === itemId)
        if (typeof targetId === 'number' && typeof itemId === 'number') {
            dispatch(editActions.removeCount({ idx, targetId ,mode}))
            if (items) {
                let idx = viewMode ? items.findIndex(item => item.id === itemId && item.upperId === targetId) : items.findIndex(item => item.id === itemId)
                let idx_drag = dragItems_item?.findIndex(dragItem_item => dragItem_item.id === itemId)
                dispatch(itemActions.removeCount({ idx: idx_drag,mode }))
                dispatch(itemActions.removeCount_relate({ idx, viewMode,mode }))
            }
        }

    
    }

    //아래 코드는
    useEffect(() => {
        // alert('여기')
        if (items) {
            const idx = (items.findIndex(item => item.id === next.id))
            const newItems = [...items];
            newItems.splice(idx, 1, next)
            dispatch(itemActions.changeItems(newItems))
            ////                            
            if (backups) {
                const Bidx = (backups.findIndex(backup => backup.id === next.id))
                const newBItems = [...backups];
                newBItems.splice(Bidx, 1, next)
                dispatch(itemActions.changeBItems(newBItems))
            }
            ////                                                         
            const createdRelations = dragItems_edit?.map(dragItem_edit => ({ UpperId: dragItem_edit.targetId, LowerId: dragItem_edit.id, point: dragItem_edit.point }));
            // 현재 그룹창에 있는 새로운 dragItems_edit를 relation 형식으로 변환
            if (createdRelations) {
                const newRelations =
                    relations?.filter(relation => relation.UpperId !== next.id)
                // 실제 relations에서 변환된 dragItems가 아닌것만 남긴 relations     
                // console.log('createdRelations', createdRelations)
                // console.log('newRelations', newRelations)
                if (createdRelations && newRelations) {
                    // console.log('updateRelations', [...createdRelations, ...newRelations])
                    const newCreateRelations = [...createdRelations, ...newRelations]
                    // console.log('newCreateRelations', newCreateRelations)
                    //newCreateRelations:새로운 relations을 dragItems로 totalPrices를 만들자
                    // console.log('newCreateRelations', newCreateRelations)
                    const newArray = changeRelationToDragItems(newItems, newCreateRelations)
                    // console.log('newArray', newArray)

                    if (relations) {
                        const totalPrice = returnTotalPrice(newItems, newCreateRelations, newArray);
                        // console.log('totalPrice', totalPrice)
                        dispatch(relateActions.calculateTotalPrice(totalPrice))

                    }
                    dispatch(itemActions.updateRelation(newCreateRelations))
                    //  변환된 dragItems가 없는 relations에 새로운 dragItems 주입

                }
            }
        }
    }, [status.message, dispatch, dragItems_edit])
    useEffect(() => {
        if (status.message === 'remove_ok' && items) {
            const idx = (items.findIndex(item => item.id === next.id))
            const newItems = [...items]
            newItems.splice(idx, 1)
            dispatch(itemActions.changeItems(newItems))
            dispatch(editActions.initForm())
        }
    }, [status, dispatch,])

    useEffect(() => {
        if (dragItems_edit) {
            const result = dragItems_edit.reduce((acc, curr) => {
                if (curr.type === 'SET' || curr.type === 'ASSY') {
                    if (items) {

                        const price = makeRelateData_Price(curr.id, relations, items)[0].sum_im_price
                        acc += price * curr.point;
                    }
                } else {
                    acc += (curr.im_price * curr.point)

                }
                return acc
            }, 0)
            // console.log(result)

            setTotalPrice(result)
        }
    }, [dragItems_edit])


    return (
        <EditFormComponent
            prev={prev}
            next={next}
            onChange={onChange}
            editImage={editImage}
            editItem={editItem}
            removeItem={removeItem}
            removeImage={removeImage}
            closeForm={closeForm}
            goodType={goodType}
            supplyers={supplyer}
            insertGroupType={insertGroupType}
            insertSupplyer={insertSupplyer}
            dragedItem={dragedItem}
            drag_on={drag_on} addCount={addCount} removeCount={removeCount}
            dragItems={dragItems_edit}
            relations={relations}
            totalPrice={totalPrice}
            viewMode={viewMode}
            drag_on_relation={drag_on_relation}
        // dragItem={dragItem} 
        // onDrop={onDrop}
        />
    );
};

export default EditFormContainer;