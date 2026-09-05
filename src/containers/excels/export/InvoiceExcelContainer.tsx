import React from 'react';
import ExportExcelComponent from './InvoiceExcelComponent';
import { OrderData } from '../../../store/slices/orderSlice';
import { useSelector } from 'react-redux';
import { generateInvoiceExcel } from '../../../lib/services/excel/invoiceService';

type Props = {
    selectedMonth: string;
    exportData?: any[];
};

const InvoiceExcelContainer: React.FC<Props> = ({ selectedMonth, exportData }) => {
    const { orderData } = useSelector(OrderData);
    const dataToUse = exportData || orderData;

    const makeInvoice = async () => {
        try {
            await generateInvoiceExcel(selectedMonth, dataToUse);
        } catch (e) {
            console.error('Failed to generate invoice excel:', e);
        }
    };

    return (
        <div>
            <ExportExcelComponent
                makeInvoice={makeInvoice}
            />
        </div>
    );
};

export default InvoiceExcelContainer;