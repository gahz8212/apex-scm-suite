
import React from 'react';
type Props = {
    invoiceData: any[] | undefined;
    totalResult: { [x: string]: { carton: number; weight: number; set: number; ea: number; price: number; }; }[]
    selectedMonth: string;
    InvoiceExcelContainer: () => JSX.Element
}
const InvoiceComponent: React.FC<Props> = ({ invoiceData, selectedMonth, totalResult, InvoiceExcelContainer }) => {
    const datas = (
        invoiceData?.map(data => <div className='invoice-rows'>
            <div className='invoice-data'>{data.itemName}</div>
            {data[selectedMonth] && <div className='invoice-data'>{data[selectedMonth]?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>}
            {data[selectedMonth] && <div className='invoice-data'>${(data.ex_price)?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>}
            {data[selectedMonth] && <div className='invoice-data'>${(data.ex_price * data[selectedMonth])?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>}
        </div>)
    )
    const footer = (totalResult?.map(result => <div className='tr'>
        {result[selectedMonth] && <div className='th'>TOTAL</div>}
        {result[selectedMonth] && <div className='th'>{result[selectedMonth].set.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} SET</div>}
        {result[selectedMonth] && <div className='th'>{result[selectedMonth].ea.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} EA</div>}
        {result[selectedMonth] && <div className='th'>${result[selectedMonth].price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>}
    </div>))
    return (
        <div className='invoice-container'>
            <div className='title'>INVOICE</div>
            <div className='table'>
                <div className='thead'>
                    <div className='tr'>
                        <div className='th'>Item</div>
                        <div className='th'>수량</div>
                        {/* <div className='th'>카톤</div> */}
                        <div className='th'>단가</div>
                        <div className='th'>금액</div>
                    </div>
                </div>
                <div className='tbody'>
                    {React.Children.toArray(datas)}
                </div>
                <div className='tfoot'>
                    {React.Children.toArray(footer)}
                </div>
            </div>
            {<InvoiceExcelContainer />}
        </div>

    );
};

export default InvoiceComponent;

