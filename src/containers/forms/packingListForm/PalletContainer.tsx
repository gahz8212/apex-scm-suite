import React, { useEffect } from 'react';
import PalletComponent from './PalletComponent';
import { useSelector, useDispatch } from 'react-redux'
import { OrderData, OrderAction } from '../../../store/slices/orderSlice';
type Props = {
    selectedMonth: string
}
const PalletContainer: React.FC<Props> = ({ selectedMonth }) => {
    const { palletData } = useSelector(OrderData)
    const dispatch = useDispatch();
    const settingPallet = (Pnumber: number, itemData: { item: string, CT_qty: number, quantity: number, weight: number, moq: number, cbm: number, sets: string, mode: string }) => {

        if (itemData.mode === 'move') {
            dispatch(OrderAction.settingPallet({ pNo: Pnumber, itemData }))

        } else {
            dispatch(OrderAction.updatePallet({ pNo: Pnumber, itemData }))

        }
    }
    const removeItem = (id: number, item: string) => {
        dispatch(OrderAction.removeItem({ id, item }))
    }
    const addCount = (id: number, item: string, value: number) => {
        dispatch(OrderAction.addCount({ id, item, value }))
    }
    const removeCount = (id: number, item: string, value: number) => {
        dispatch(OrderAction.removeCount({ id, item, value }))

    }
    const onInputPallet = () => {
        dispatch(OrderAction.inputPallet(palletData))
    }
    const resetPallet = () => {
        dispatch(OrderAction.resetPallet())
    }
    useEffect(() => {

        dispatch(OrderAction.getPalletData())
    }, [])
    return (
        <div>
            <PalletComponent palletData={palletData} settingPallet={settingPallet}
                addCount={addCount} removeCount={removeCount}
                onInputPallet={onInputPallet} removeItem={removeItem} resetPallet={resetPallet} />
        </div>
    );
};

export default PalletContainer;