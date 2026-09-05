import React, { useEffect } from 'react';
import ItemPickerComponent from './ItemPickerComponent';
import { useSelector, useDispatch } from 'react-redux';
import { itemData, itemActions } from '../../../store/slices/itemSlice'
const ItemPickerContainer = () => {
    const { pickedData } = useSelector(itemData)
    const dispatch = useDispatch();
    const addPicked = (picked: {}) => {
        if (picked) {
            dispatch(itemActions.addPicked(picked))
        }
    }
    const initPicked = () => {
        dispatch(itemActions.initPicked())
    }
    const removePicked = (id: number) => {
        if (id)
            dispatch(itemActions.removePicked(id))
    }
    const inputPicked = () => {
        dispatch(itemActions.inputPicked(pickedData))
        // dispatch(itemActions.getPicked())
    }
    const onChange = (e: any) => {
        const { name, value, id } = e.target
        // console.log('name, value, id', name, value, id)
        dispatch(itemActions.onChangePicked({ name, id, value }))
    }
    useEffect(() => {
        dispatch(itemActions.getPicked())
    }, [])
    return (
        <div>
            <ItemPickerComponent
                inputPicked={inputPicked}
                removePicked={removePicked}
                pickedData={pickedData}
                addPicked={addPicked}
                initPicked={initPicked}
                onChange={onChange}
            />
        </div>
    );
};

export default ItemPickerContainer;