import React from 'react';

type Props = {
    fromCurrency: string;
    searchCurrency: () => void;
    resultCurrency: { [key: string]: { [key: string]: number } } | null
}
const HomeComponent: React.FC<Props> = ({ fromCurrency, resultCurrency }) => {

    if (!resultCurrency) return null;
    const usdRate = resultCurrency[fromCurrency]?.usd ? (1 / resultCurrency[fromCurrency].usd).toFixed(1) : "-";
    const jpyRate = resultCurrency[fromCurrency]?.jpy ? (1 / resultCurrency[fromCurrency].jpy).toFixed(1) : "-";

    return (
        <div style={{ margin: '3rem auto', maxWidth: '800px', padding: '0 1rem' }}>
            <div className="title" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
                실시간 환율 정보 (KRW 기준)
            </div>
            <div className="curr" style={{ display: 'flex', gap: '1rem' }}>
                <div className='currData' style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <span className='unit' style={{ fontWeight: 700, color: '#2563eb', fontSize: '1.1rem' }}>1 USD ($)</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 600, color: '#0f172a' }}>₩ {Number(usdRate).toLocaleString()}</span>
                </div>
                <div className='currData' style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <span className='unit' style={{ fontWeight: 700, color: '#2563eb', fontSize: '1.1rem' }}>1 JPY (¥)</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 600, color: '#0f172a' }}>₩ {Number(jpyRate).toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

export default HomeComponent;