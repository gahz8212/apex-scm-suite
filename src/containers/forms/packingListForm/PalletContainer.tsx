import React, { useEffect, useMemo } from 'react';
import PalletComponent from './PalletComponent';
import { useSelector, useDispatch } from 'react-redux'
import { OrderData, OrderAction } from '../../../store/slices/orderSlice';
import { calculatePackingData } from '../../../lib/utils/calculatePackingData';
type Props = {
    selectedMonth: string;
    exportData?: any[];
};
const PalletContainer: React.FC<Props> = ({ selectedMonth, exportData }) => {
    const { palletData, orderData } = useSelector(OrderData);
    const dataToUse = exportData !== undefined ? exportData : orderData;
    const dispatch = useDispatch();

    const packingCartonMap = useMemo(() => {
        const packingData = calculatePackingData(dataToUse, selectedMonth);
        const map: { [itemName: string]: number } = {};
        packingData?.forEach(item => {
            if (item.CT_qty > 0) {
                map[item.itemName] = (map[item.itemName] || 0) + item.CT_qty;
            }
        });
        return map;
    }, [dataToUse, selectedMonth]);

    const settingPallet = (Pnumber: number, itemData: { item: string, totalCT_qty?: number, CT_qty: number, quantity: number, weight: number, moq: number, cbm: number, sets: string, mode: string }) => {

        if (itemData.mode === 'move') {
            dispatch(OrderAction.settingPallet({ pNo: Pnumber, itemData }))

        } else {
            dispatch(OrderAction.updatePallet({ pNo: Pnumber, itemData }))

        }
    }
    const removeItem = (id: number, item: string, itemIndex?: number) => {
        dispatch(OrderAction.removeItem({ id, item, itemIndex }))
    }
    const reorderPallet = (pNo: number, sourceIdx: number, targetIdx: number) => {
        dispatch(OrderAction.reorderPallet({ pNo, sourceIdx, targetIdx }));
    };
    const addCount = (id: number, item: string, value: number, itemIndex?: number, maxAllowed?: number) => {
        dispatch(OrderAction.addCount({ id, item, value, itemIndex, maxAllowed }))
    }
    const removeCount = (id: number, item: string, value: number, itemIndex?: number) => {
        dispatch(OrderAction.removeCount({ id, item, value, itemIndex }))
    }
    const onInputPallet = () => {
        dispatch(OrderAction.inputPallet(palletData));
        alert('팔레트 정보가 저장되었습니다.');
    }
    const resetPallet = () => {
        dispatch(OrderAction.resetPallet())
    }
    useEffect(() => {

        dispatch(OrderAction.getPalletData())
    }, [])
    return (
        <div>
            <PalletComponent
                palletData={palletData}
                packingCartonMap={packingCartonMap}
                settingPallet={settingPallet}
                reorderPallet={reorderPallet}
                addCount={addCount}
                removeCount={removeCount}
                onInputPallet={onInputPallet}
                removeItem={removeItem}
                resetPallet={resetPallet}
            />
        </div>
    );
};

export default PalletContainer;