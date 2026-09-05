import React from 'react';
type Props = {
    makeCartonPacking: (type: string) => void;

}
const CartonExcelComponent: React.FC<Props> = ({ makeCartonPacking }) => {
    const onChange = () => {  }
    return (
        <div>
            <input type="checkbox" name="" id="invoice" />
            <label htmlFor="invoice">인보이스</label>
            <input type="checkbox" name="" id="carton" checked={true} onChange={onChange} />
            <label htmlFor="carton">CT_packing</label>
            <input type="checkbox" name="" id="pallet"  onChange={onChange}/>
            <label htmlFor="pallet">PT_packing</label>
            <div>

                <button type='button' onClick={() => { makeCartonPacking('CT') }}>카톤 리스트</button>
                <button type='button' onClick={() => { makeCartonPacking('PT') }}>파레트 리스트</button>
            </div>

        </div>
    );
};

export default CartonExcelComponent;