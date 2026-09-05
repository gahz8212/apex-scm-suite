export interface PackingItem {
    itemName: string;
    groupName?: string;
    category?: string;
    isSubMaterial?: boolean;
    ex_price?: number;
    CT_qty: number;
    quantity: number;
    weight: number;
    moq: number;
    cbm: number;
    sets: string;
    isDirect?: boolean;
    [key: string]: any;
}

export const calculatePackingData = (orderData: any[] | null | undefined, selectedMonth: string): PackingItem[] => {
    if (!orderData || !selectedMonth) return [];
    const filteredPackingData: PackingItem[] = orderData
        .filter((data) => data[selectedMonth] !== undefined || data.quantity !== undefined)
        .map(data => ({
            itemName: data.itemName,
            groupName: data.groupName,
            category: data.category,
            isSubMaterial: Boolean(data.isSubMaterial || data.category === 'REPAIR'),
            ex_price: data.ex_price,
            CT_qty: data.CT_qty !== undefined && data.CT_qty !== null ? Number(data.CT_qty) : (data.moq ? (Number(data[selectedMonth] || data.quantity) / data.moq) : 0),
            quantity: Number(data[selectedMonth] !== undefined ? data[selectedMonth] : data.quantity) || 0,
            weight: Number(data.weight) || 0,
            moq: Number(data.moq) || 0,
            cbm: (data.cbm !== undefined && data.cbm !== '선택' && Number(data.cbm) > 0) ? Number(data.cbm) : 0,
            sets: data.sets || 'SET',
            isDirect: Boolean(data.isDirect)
        }));

    if (filteredPackingData) {
        let selectedapplyMoqData = [...filteredPackingData];
        selectedapplyMoqData.forEach(data => {
            if (!data.isDirect && data.moq && data.quantity % data.moq) {
                if (data.quantity % data.moq === data.quantity) {
                    if ((data.quantity / data.moq) * 100 > 70) {
                        let idx = filteredPackingData.findIndex(newData => data.itemName === newData.itemName);
                        const newItem = {
                            itemName: data.itemName,
                            groupName: data.groupName,
                            category: data.category,
                            ex_price: data.ex_price,
                            CT_qty: 1,
                            quantity: data.quantity % data.moq,
                            weight: data.weight,
                            moq: data.moq,
                            cbm: data.cbm,
                            sets: data.sets,
                            isDirect: data.isDirect,
                            isSubMaterial: data.isSubMaterial
                        };
                        filteredPackingData.splice(idx, 1, newItem);
                    } else {
                        let idx = filteredPackingData.findIndex(newData => data.itemName === newData.itemName);
                        filteredPackingData.splice(idx, 1);
                        filteredPackingData.push({
                            itemName: data.itemName,
                            groupName: data.groupName,
                            category: data.category,
                            ex_price: data.ex_price,
                            CT_qty: 0,
                            quantity: data.quantity % data.moq,
                            weight: data.weight,
                            moq: data.moq,
                            cbm: data.cbm,
                            sets: data.sets,
                            isDirect: data.isDirect,
                            isSubMaterial: data.isSubMaterial
                        });
                    }
                } else {
                    let idx = filteredPackingData.findIndex(newData => data.itemName === newData.itemName);
                    const newData = {
                        itemName: data.itemName,
                        groupName: data.groupName,
                        category: data.category,
                        ex_price: data.ex_price,
                        CT_qty: (data.quantity - (data.quantity % data.moq)) / data.moq,
                        quantity: data.quantity - (data.quantity % data.moq),
                        weight: data.weight,
                        moq: data.moq,
                        cbm: data.cbm,
                        sets: data.sets,
                        isDirect: data.isDirect,
                        isSubMaterial: data.isSubMaterial
                    };
                    filteredPackingData.splice(idx, 1, newData);
                    filteredPackingData.push({
                        itemName: data.itemName,
                        groupName: data.groupName,
                        category: data.category,
                        ex_price: data.ex_price,
                        CT_qty: 0,
                        quantity: data.quantity % data.moq,
                        weight: data.weight,
                        moq: data.moq,
                        cbm: data.cbm,
                        sets: data.sets,
                        isDirect: data.isDirect,
                        isSubMaterial: data.isSubMaterial
                    });
                }
            }
        });
    }
    return filteredPackingData;
};
