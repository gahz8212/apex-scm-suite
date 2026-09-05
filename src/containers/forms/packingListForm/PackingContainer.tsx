import React from 'react';
import PackingComponent from './PackingComponent';
import { useSelector } from 'react-redux'
import { OrderData } from '../../../store/slices/orderSlice';
import CartonExcelContainer from '../../excels/export/CartonExcelContainer';
import { calculatePackingData } from '../../../lib/utils/calculatePackingData';
type Props = {

    selectedMonth: string
}
const PackingContainer: React.FC<Props> = ({ selectedMonth }) => {
    const { orderData, palletData } = useSelector(OrderData)
    const filteredPackingData = calculatePackingData(orderData, selectedMonth);

    let totalResult: { [x: string]: { carton: number; weight: number; cbm: number; price: number; }; }[] = [];
    if (orderData) {
        const headers = Object.keys(orderData[0]).slice(1, 6)
        totalResult =
            headers.map(header => {
                let carton = 0;
                let weight = 0;
                let cbm = 0;
                let price = 0;

                filteredPackingData?.forEach(invoice => {

                    carton += invoice.CT_qty
                    weight += invoice.weight * invoice.CT_qty
                    cbm += invoice.cbm * invoice.CT_qty
                })
                return { [header]: { carton, weight, cbm, price } };
            })

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