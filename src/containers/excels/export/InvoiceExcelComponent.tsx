import React from 'react';
type Props = {
    makeInvoice: () => void;
}
const InvoiceExcelComponent: React.FC<Props> = ({ makeInvoice }) => {
    const onChange = () => { }
    return (
        <div>

            <input type="checkbox" name="" id="invoice" checked={true} onChange={onChange} />
            <label htmlFor="invoice">인보이스</label>
            <input type="checkbox" name="" id="carton" onChange={onChange} />
            <label htmlFor="carton">CT_packing</label>
            <input type="checkbox" name="" id="pallet" onChange={onChange} />
            <label htmlFor="pallet">PT_packing</label>
            <div>
                <button type='button' onClick={makeInvoice}>출력</button>
            </div>

        </div>
    );
};

export default InvoiceExcelComponent;