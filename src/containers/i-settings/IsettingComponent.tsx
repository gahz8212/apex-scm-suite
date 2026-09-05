import React from 'react';
import { useDrag } from 'react-use-gesture';
import InputFormContainer from '../forms/inputForm/InputFormContainer';
import EditFormContainer from "../forms/editForm/EditFormContainer";
import CardContainer from '../common/card/CardContainer';
import RelationContainer from '../forms/relationForm/RelationContainer';
import ItemPickerContainer from '../forms/itemPicker/ItemPickerContainer';

type Props = {

    input: { visible: boolean; position: { x: number; y: number } };
    edit: { visible: boolean; position: { x: number; y: number } };
    relate: { visible: boolean; position: { x: number; y: number } };
    picker: { visible: boolean; position: { x: number; y: number } };
    changePosition: (form: string, position: { x: number, y: number }) => void;
    openForm: (form: string) => void;



}

const IsettingComponent: React.FC<Props> = ({ input, edit, relate, openForm, changePosition, picker }) => {


    const inputPos = useDrag(params => { changePosition('input', { x: params.offset[0] + 250, y: params.offset[1] + 300 }) })
    const editPos = useDrag(params => { changePosition('edit', { x: params.offset[0] + 250, y: params.offset[1] + 300 }) })
    const pickerPos = useDrag(params => { changePosition('picker', { x: params.offset[0] + 250, y: params.offset[1] + 300 }) })
    // const relatePos = useDrag(params => { changePosition('relate', { x: params.offset[0] + xy.x, y: params.offset[1] + xy.y }) })



    return (
        <div className='isetting-wraper'>


            {input.visible && <div >
                <div {...inputPos()} style={{
                    color: 'white',
                    width: '300px',
                    position: 'fixed',
                    top: input.position.y,
                    left: input.position.x,
                    zIndex: 2,
                    textAlign: 'center',
                    boxSizing: 'border-box'
                }}>
                    <div style={{ width: '300px', padding: '1rem', userSelect: 'none' }}></div>
                </div>
                <div style={{ position: 'fixed', top: input.position.y, left: input.position.x, zIndex: 1 }}>

                    <InputFormContainer />
                </div>
            </div>}

            {edit.visible && <div>
                <div {...editPos()} style={{ color: 'white', position: 'fixed', top: edit.position.y, left: edit.position.x, zIndex: 2, textAlign: 'center', width: '300px', boxSizing: 'border-box' }}>
                    <div style={{ width: '300px', padding: '1rem', userSelect: 'none' }}></div>
                </div>
                <div style={{ position: 'fixed', top: edit.position.y, left: edit.position.x, zIndex: 1 }}>
                    <EditFormContainer />
                </div>
            </div>}
            {picker.visible && <div>
                <div {...pickerPos()} style={{
                    color: 'white',
                    position: 'fixed',
                    top: picker.position.y,
                    left: picker.position.x,
                    zIndex: 2,
                    textAlign: 'center',
                    width: '300px',
                    boxSizing: 'border-box'
                }}>
                    <div style={{ width: '300px', padding: '1rem', userSelect: 'none' }}></div>
                </div>
                <div style={{ position: 'fixed', top: picker.position.y, left: picker.position.x, zIndex: 1 }}>
                    <ItemPickerContainer />
                </div>
            </div>}
            {relate.visible && <div style={{ position: 'fixed', top: relate.position.y + 40, left: relate.position.x - 130, zIndex: 1 }}>
                {/* <div {...relatePos()} style={{ color: 'black', position: 'fixed', top: relate.position.y, left: relate.position.x, zIndex: 2, textAlign: 'center', width: '300px' }}>
                    <span style={{ color: 'black', display: 'inline-block', width: '300px', padding: '.3rem', userSelect: 'none' }}>하위 아이템</span>
                </div>
                <div style={{ , top: relate.position.y, left: relate.position.x, zIndex: 1 }}>
                </div> */}
                <RelationContainer />
            </div>}
            <CardContainer />
            <div style={{ height: '90px' }}></div>
            <span onClick={() => openForm('input')} className="material-symbols-outlined write">
                edit_document
            </span>
            <span onClick={() => openForm('picker')} className="material-symbols-outlined picker">
                edit_document
            </span>
        </div >
    );
};
export default IsettingComponent;