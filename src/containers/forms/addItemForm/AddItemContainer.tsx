import React from 'react';
import AddItemComponent from './AddItemComponent';
import { useSelector, useDispatch } from 'react-redux';
import { OrderAction, OrderData } from '../../../store/slices/orderSlice';
const AddItemContainer = () => {
    const dispatch = useDispatch();
    const { dummyItems } = useSelector(OrderData)

    return (
        <div>
            <AddItemComponent dummyItems={dummyItems}/>
        </div>
    );
};

export default AddItemContainer;