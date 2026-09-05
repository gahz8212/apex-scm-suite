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
        padding: '1.5rem', position: 'relative', backgroundColor: '#ffffff',
        width: '320px', height: '320px', overflow: 'auto',
        border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
    }}>

        {relate_view && relate_view.map(view => <div
            key={view.currentId}
            style={{
                marginTop: '0.5rem',
                position: 'absolute',
                top: view.top * 1.1,
                left: view.left - 40,
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                backgroundColor: '#f8fafc',
                fontSize: '.75rem',
                width: '80px',
                height: '70px',
                marginLeft: '1rem',
                padding: '0.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
        >
            <div style={{ fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{view.itemName}</div>
            <div style={{ color: '#2563eb', fontWeight: 500 }}>₩{view.sum_im_price.toLocaleString()}</div>
        </div>)}
    </div>)

};

export default RelationComponent;