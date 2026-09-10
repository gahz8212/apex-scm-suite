import React from 'react';
type Props = {
    makeCartonPacking: (type: string) => void;
}
const CartonExcelComponent: React.FC<Props> = ({ makeCartonPacking }) => {
    const onChange = () => { };
    return (
        <div className="excel-actions-wrap">
            <div className="doc-options">
                <label className="doc-check-label" htmlFor="carton-inv">
                    <input type="checkbox" id="carton-inv" onChange={onChange} />
                    <span>인보이스 (CI)</span>
                </label>
                <label className="doc-check-label" htmlFor="carton-ct">
                    <input type="checkbox" id="carton-ct" checked={true} onChange={onChange} />
                    <span>CT Packing</span>
                </label>
                <label className="doc-check-label" htmlFor="carton-pt">
                    <input type="checkbox" id="carton-pt" onChange={onChange}/>
                    <span>PT Packing</span>
                </label>
            </div>
            <div className="btn-group">
                <button type='button' className="btn-excel-download secondary" onClick={() => { makeCartonPacking('CT') }} title="카톤 패킹 엑셀 다운로드">
                    <span className="material-symbols-outlined">description</span>
                    <span>카톤 리스트</span>
                </button>
                <button type='button' className="btn-excel-download" onClick={() => { makeCartonPacking('PT') }} title="파레트 패킹 엑셀 다운로드">
                    <span className="material-symbols-outlined">download</span>
                    <span>파레트 리스트</span>
                </button>
            </div>
        </div>
    );
};

export default CartonExcelComponent;