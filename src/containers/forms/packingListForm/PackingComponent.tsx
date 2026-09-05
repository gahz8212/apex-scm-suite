import React from 'react';
type Props = {

    selectedMonth: string;
    packingData: any[] | undefined;
    totalResult: { [x: string]: { carton: number; weight: number; cbm: number; price: number; }; }[]
    CartonExcelContainer: () => JSX.Element
}
const PackingComponent: React.FC<Props> = ({ selectedMonth, packingData, totalResult, CartonExcelContainer }) => {
    // console.log('packingData', packingData)
    let newData: { [key: string]: number | string }[] = []
    if (packingData && selectedMonth) {
        const headers = Object.keys(packingData[0]).slice(1, 6)
        for (let data of packingData) {
            let origin = {};
            let extra = {}
            for (let header of headers) {
                if (data[header] - data[header] / data.moq) {
                    origin = { ...origin, ...{ itemName: data.itemName } }
                }
                if ((data[header]) % data.moq) {
                    extra = { ...extra, ...{ itemName: data.itemName } }
                }
            }
            if (Object.keys(origin).length) {
                newData.push(origin)
            }
            if (Object.keys(extra).length) {
                newData.push(extra)
            }
        }
    }
    // const dragItem = useRef<number>(0);
    // const dragOverItem = useRef<number>(0);
    // const dragItemStart = (index: number) => {
    //     dragItem.current = index
    //     // console.log('dragItem.current', dragItem.current)
    // }
    // const dragItemEnter = (index: number) => {
    //     dragOverItem.current = index
    //     console.log('dragOverItem.current', dragOverItem.current)
    // }
    // const drop = () => {
    //     const newList = JSON.parse(JSON.stringify(newData));
    //     let target = newList[dragOverItem.current]
    //     newList[dragOverItem.current] = newList[dragItem.current]
    //     newList[dragItem.current] = target
    //     // console.log(newList)
    // }
    const datas = (
        packingData?.map((data, index) => {
            const ctVal = Number(data.CT_qty) || 0;
            const totalWeight = data.totalWeight !== undefined && ctVal > 0 && Number(data.totalWeight) > 0
                ? Number(data.totalWeight)
                : (ctVal > 0 && Number(data.weight) > 0 ? (ctVal * Number(data.weight)) : 0);
            const totalCbm = ctVal > 0 && Number(data.cbm) > 0 ? (ctVal * Number(data.cbm)) : 0;

            return (
                <div
                    key={index}
                    className='packing-rows'
                    draggable
                    onDragStart={(e) => {
                        const img = new Image();
                        img.src = './images/package.png';
                        e.dataTransfer.setDragImage(img, 50, 50);
                        e.dataTransfer.setData('item', JSON.stringify({
                            name: data.itemName,
                            totalCT_qty: data.CT_qty,
                            CT_qty: data.CT_qty,
                            quantity: data.quantity,
                            weight: data.weight,
                            moq: data.moq,
                            cbm: data.cbm,
                            sets: data.sets,
                            category: data.category,
                            isSubMaterial: Boolean(data.isSubMaterial || data.category === 'REPAIR' || data.sets === 'EA'),
                            mode: 'move'
                        }));
                    }}
                >
                    <div className='packing-data'>{data.itemName}</div>
                    <div className='invoice-data'>{ctVal > 0 ? ctVal.toLocaleString() : ''}</div>
                    <div className='invoice-data'>{totalWeight > 0 ? totalWeight.toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ''}</div>
                    <div className='invoice-data'>{totalCbm > 0 ? totalCbm.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ''}</div>
                </div>
            );
        })
    );
    const footer = (totalResult?.map((result, index) => {
        const item = result[selectedMonth];
        if (!item) return null;
        return (
            <div key={index} className='tr'>
                <div className='th'>TOTAL</div>
                <div className='th'>{item.carton > 0 ? `${item.carton.toLocaleString()}C/T` : ''}</div>
                <div className='th'>{item.weight > 0 ? `${item.weight.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}Kg` : ''}</div>
                <div className='th'>{item.cbm > 0 ? `${item.cbm.toFixed(2)}CBM` : ''}</div>
            </div>
        );
    }));
    return (
        <div className='packing-container'>
            <div className="title">PACKING</div>
            <div className='table'>
                <div className='thead'>
                    <div className='tr'>
                        <div className='th'>Item</div>

                        <div className='th'>카톤</div>
                        <div className='th'>무게(Kg)</div>
                        <div className='th'>CBM</div>
                    </div>
                </div>
                <div className='tbody'>
                    {React.Children.toArray(datas)}
                </div>
                <div className='tfoot'>
                    {React.Children.toArray(footer)}
                </div>
            </div>
            {<CartonExcelContainer />}
        </div>

    );
};
export default PackingComponent;