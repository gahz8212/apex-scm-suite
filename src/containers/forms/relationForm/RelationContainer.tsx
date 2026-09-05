import React, { useEffect, useState } from 'react';
import RelationComponent from './RelationComponent';
import { useDispatch, useSelector } from 'react-redux';
import { relateData } from '../../../store/slices/relationSlice';
import { formActions } from '../../../store/slices/formSlice';
const RelationContainer = () => {
    const dispatch = useDispatch()
    const { relate_view_horizon } = useSelector(relateData)
    const [onlyParts, setOnlyParts] = useState<{
        currentId: number;
        type: string,
        itemName: string;

        top: number;
        left: number;
        point: number;
        sum_im_price: number;
        ex_price: number;
    }[] | null>(relate_view_horizon)

    useEffect(() => {
        if (relate_view_horizon) {
            const newItems = [...relate_view_horizon]
            // newItems.splice(0, 1)
            setOnlyParts(newItems)
        }
    }, [relate_view_horizon])
    return (
        <div>
            <RelationComponent relate_view={onlyParts} />
        </div>
    );
};

export default RelationContainer;