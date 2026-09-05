import React from 'react';
type Props = {
    dummyItems: any[] | null;
}
const AddItemComponent: React.FC<Props> = ({ dummyItems }) => {
    console.log('dummyItems', dummyItems)
    return (
        <>
            PARTS / DUMMIES
            <div style={{
                height: '400px', overflowY: 'auto', background: 'white', padding: '1rem'
            }}>

                {/* {dummyItems?.map(item => <div style={{ padding: '.3rem' }}>{item.NAME}</div>)} */}
            </div >
        </>
    );
};

export default AddItemComponent;