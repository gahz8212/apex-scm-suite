import React from 'react';
type Props = {
    makeInvoice: () => void;
}
const InvoiceExcelComponent: React.FC<Props> = ({ makeInvoice }) => {
    const onChange = () => { };
    return (
        <div className="excel-actions-wrap">
            <div className="doc-options">
                <label className="doc-check-label" htmlFor="invoice">
                    <input type="checkbox" id="invoice" checked={true} onChange={onChange} />
                    <span>인보이스 (CI)</span>
                </label>
                <label className="doc-check-label" htmlFor="carton">
                    <input type="checkbox" id="carton" onChange={onChange} />
                    <span>CT Packing</span>
                </label>
                <label className="doc-check-label" htmlFor="pallet">
                    <input type="checkbox" id="pallet" onChange={onChange} />
                    <span>PT Packing</span>
                </label>
            </div>
            <button type='button' className="btn-excel-download" onClick={makeInvoice} title="엑셀 인보이스 다운로드">
                <span className="material-symbols-outlined">download</span>
                <span>엑셀 출력</span>
            </button>
        </div>
    );
};

export default InvoiceExcelComponent;