export interface PackingItem {
    itemName: string;
    CT_qty: number;
    quantity: number;
    weight: number;
    moq: number;
    cbm: number;
    sets: string;
    [key: string]: any;
}

export const calculatePackingData = (orderData: any[] | null | undefined, selectedMonth: string): PackingItem[] => {
    if (!orderData || !selectedMonth) return [];
    const filteredPackingData: PackingItem[] = orderData
        .filter((data) => data[selectedMonth])
        .map(data => ({
            itemName: data.itemName,
            CT_qty: data.moq ? (data[selectedMonth] / data.moq) : 0,
            quantity: data[selectedMonth],
            weight: data.weight,
            moq: data.moq,
            cbm: data.cbm,
            sets: data.sets
        }));

    if (filteredPackingData) {
        let selectedapplyMoqData = [...filteredPackingData];
        selectedapplyMoqData.forEach(data => {
            if (data.moq && data.quantity % data.moq) {
                if (data.quantity % data.moq === data.quantity) {
                    if ((data.quantity / data.moq) * 100 > 70) {
                        let idx = filteredPackingData.findIndex(newData => data.itemName === newData.itemName);
                        const newItem = {
                            itemName: data.itemName,
                            CT_qty: 1,
                            quantity: data.quantity % data.moq,
                            weight: data.weight,
                            moq: data.moq,
                            cbm: data.cbm,
                            sets: data.sets
                        };
                        filteredPackingData.splice(idx, 1, newItem);
                    } else {
                        let idx = filteredPackingData.findIndex(newData => data.itemName === newData.itemName);
                        filteredPackingData.splice(idx, 1);
                        filteredPackingData.push({
                            itemName: data.itemName,
                            CT_qty: 0,
                            quantity: data.quantity % data.moq,
                            weight: data.weight,
                            moq: data.moq,
                            cbm: data.cbm,
                            sets: data.sets
                        });
                    }
                } else {
                    let idx = filteredPackingData.findIndex(newData => data.itemName === newData.itemName);
                    const newData = {
                        itemName: data.itemName,
                        CT_qty: (data.quantity - (data.quantity % data.moq)) / data.moq,
                        quantity: data.quantity - (data.quantity % data.moq),
                        weight: data.weight,
                        moq: data.moq,
                        cbm: data.cbm,
                        sets: data.sets
                    };
                    filteredPackingData.splice(idx, 1, newData);
                    filteredPackingData.push({
                        itemName: data.itemName,
                        CT_qty: 0,
                        quantity: data.quantity % data.moq,
                        weight: data.weight,
                        moq: data.moq,
                        cbm: data.cbm,
                        sets: data.sets
                    });
                }
            }
        });
    }
    return filteredPackingData;
};
