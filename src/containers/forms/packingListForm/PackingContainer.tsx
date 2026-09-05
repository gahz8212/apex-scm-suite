import React from 'react';
import PackingComponent from './PackingComponent';
import { useSelector } from 'react-redux'
import { OrderData } from '../../../store/slices/orderSlice';
import CartonExcelContainer from '../../excels/export/CartonExcelContainer';
import { calculatePackingData } from '../../../lib/utils/calculatePackingData';
type Props = {
    selectedMonth: string;
    exportData?: any[];
};

const PackingContainer: React.FC<Props> = ({ selectedMonth, exportData }) => {
    const { orderData, palletData } = useSelector(OrderData);
    const dataToUse = exportData !== undefined ? exportData : orderData;
    const filteredPackingData = calculatePackingData(dataToUse, selectedMonth);

    let totalResult: { [x: string]: { carton: number; weight: number; cbm: number; price: number; }; }[] = [];
    if (filteredPackingData) {
        let carton = 0;
        let weight = 0;
        let cbm = 0;
        let price = 0;

        filteredPackingData.forEach(invoice => {
            const ct = Number(invoice.CT_qty) || 0;
            const wt = invoice.totalWeight !== undefined && ct > 0 && Number(invoice.totalWeight) > 0
                ? Number(invoice.totalWeight)
                : (ct > 0 && Number(invoice.weight) > 0 ? (ct * Number(invoice.weight)) : 0);
            const cb = ct > 0 && Number(invoice.cbm) > 0 ? (ct * Number(invoice.cbm)) : 0;
            carton += ct;
            weight += wt;
            cbm += cb;
        });
        totalResult = [{ [selectedMonth]: { carton, weight: Number(weight.toFixed(1)), cbm: Number(cbm.toFixed(2)), price } }];
    }
    return (
        <div>
            <PackingComponent
                selectedMonth={selectedMonth}
                packingData={filteredPackingData}
                totalResult={totalResult}
                CartonExcelContainer={() => <CartonExcelContainer
                    packingData={filteredPackingData}
                    palletData={palletData}
                />} />
        </div>
    );
};

export default PackingContainer;