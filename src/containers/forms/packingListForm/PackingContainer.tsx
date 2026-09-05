import React from 'react';
import PackingComponent from './PackingComponent';
import { useSelector } from 'react-redux'
import { OrderData } from '../../../store/slices/orderSlice';
import CartonExcelContainer from '../../excels/export/CartonExcelContainer';
type Props = {

    selectedMonth: string
}
const PackingContainer: React.FC<Props> = ({ selectedMonth }) => {
    const { orderData, palletData } = useSelector(OrderData)
    // console.log('orderData', orderData)
    const filteredPackingData = orderData?.filter((data) => data[selectedMonth])
        .map(data => (
            {
                itemName: data.itemName,
                CT_qty: data.moq ? (data[selectedMonth] / data.moq) : 0,
                quantity: data[selectedMonth],
                weight: data.weight,
                moq: data.moq,
                cbm: data.cbm,
                sets: data.sets


            }))
    // console.log('filteredPackingData', filteredPackingData)
    if (filteredPackingData) {
        let selectedapplyMoqData = [...filteredPackingData]
        selectedapplyMoqData.forEach(data => {
            if (data.quantity % data.moq) {

                if (data.quantity % data.moq === data.quantity) {
                    if (data.quantity / data.moq * 100 > 70) {
                        let idx = filteredPackingData.findIndex(newData => data.itemName === newData.itemName)
                        const newItem = ({
                            itemName: data.itemName,
                            CT_qty: 1,
                            quantity: data.quantity % data.moq,
                            weight: data.weight,
                            moq: data.moq,
                            cbm: data.cbm,
                            sets: data.sets
                        })
                        filteredPackingData.splice(idx, 1, newItem);
                    } else {
                        let idx = filteredPackingData.findIndex(newData => data.itemName === newData.itemName)
                        filteredPackingData.splice(idx, 1);
                        filteredPackingData.push({
                            itemName: data.itemName,
                            CT_qty: 0,
                            quantity: data.quantity % data.moq,
                            weight: data.weight,
                            moq: data.moq,
                            cbm: data.cbm,
                            sets: data.sets
                        })
                    }
                }
                else {
                    let idx = filteredPackingData.findIndex(newData => data.itemName === newData.itemName)
                    const newData = {
                        itemName: data.itemName,
                        CT_qty: (data.quantity - (data.quantity % data.moq)) / data.moq,
                        quantity: data.quantity - (data.quantity % data.moq),
                        weight: data.weight,
                        moq: data.moq,
                        cbm: data.cbm,
                        sets: data.sets
                    }
                    filteredPackingData.splice(idx, 1, newData);
                    filteredPackingData.push({
                        itemName: data.itemName,
                        CT_qty: 0,
                        quantity: data.quantity % data.moq,
                        weight: data.weight,
                        moq: data.moq,
                        cbm: data.cbm,
                        sets: data.sets
                    })
                }
            }
        })
    }
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