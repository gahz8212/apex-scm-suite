import React from 'react';
import InvoiceComponent from './InvoiceComponent';
import InvoiceExcelContainer from '../../excels/export/InvoiceExcelContainer';
import { useDispatch, useSelector } from 'react-redux'
import { OrderData } from '../../../store/slices/orderSlice';
type Props = {
    selectedMonth: string;
    exportData?: any[];
};

const InvoiceContainer: React.FC<Props> = ({ selectedMonth, exportData }) => {
    const { orderData } = useSelector(OrderData);
    const dataToUse = exportData !== undefined ? exportData : orderData;

    // body 에 들어가는 데이터 객체    
    const filteredInvoiceData = dataToUse?.filter((data: any) => {
        const val = data[selectedMonth] !== undefined ? data[selectedMonth] : data.quantity;
        return Number(val) > 0;
    });

    // 하단 total에 들어가는 데이터 객체
    let totalResult: { [x: string]: { carton: number; weight: number; set: number; ea: number; price: number; }; }[] = [];
    if (filteredInvoiceData) {
        let carton = 0;
        let weight = 0;
        let set = 0;
        let ea = 0;
        let price = 0;
        filteredInvoiceData.forEach((invoice: any) => {
            const qty = Number(invoice[selectedMonth] !== undefined ? invoice[selectedMonth] : invoice.quantity) || 0;
            const exPrice = Number(invoice.ex_price) || 0;
            const ctQty = Number(invoice.CT_qty) || 0;
            const wt = Number(invoice.weight) || 0;

            invoice.sets === 'SET' ? (set += qty) : (ea += qty);
            carton += ctQty;
            weight += wt * ctQty;
            price += qty * exPrice;
        });
        totalResult = [{ [selectedMonth]: { carton, weight, set, ea, price } }];
    }

    return (
        <div>
            <InvoiceComponent
                invoiceData={filteredInvoiceData}
                selectedMonth={selectedMonth}
                totalResult={totalResult}
                InvoiceExcelContainer={() => <InvoiceExcelContainer selectedMonth={selectedMonth} exportData={filteredInvoiceData} />}
            />
        </div>
    );
};

export default InvoiceContainer;