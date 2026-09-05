import React from 'react';
type Props = {
    relate_view: {
        currentId: number;
        type: string;
        itemName: string;
        top: number;
        left: number;
        point: number;
        sum_im_price: number;
        ex_price: number;
    }[] | null;
}
const RelationComponent: React.FC<Props> = ({ relate_view, }) => {
    return (<div style={{
        padding: '3rem', position: 'relative', backgroundColor: 'yellow'
        , width: '300px', height: '300px', overflow: 'auto',
    }}>

        {relate_view && relate_view.map(view => <div
            key={view.currentId}
            style={{
                marginTop: '1rem',
                position: 'absolute',
                top: view.top * 1.1,
                left: view.left - 40,
                border: '1px solid black',
                fontSize: '.7rem',
                width: '70px',
                height: '70px',
                marginLeft: '1rem',

            }}
        >
            <div>{view.itemName}</div>
            <div>\{view.sum_im_price}</div>
        </div>)}
    </div>)

};

export default RelationComponent;