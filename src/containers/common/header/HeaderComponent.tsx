import React from 'react';
import { Link } from 'react-router-dom'

type Props = {
    auth: { id: number | '', name: string } | null;
    onLogout: () => void;
}

const HeaderComponent: React.FC<Props> = ({ auth, onLogout }) => {
    return (
        <>
            <div className='headerContainer'>
                <div className="headerWraper">

                    <div className="logo">
                        <Link to={auth ? '/home' : '/'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.5px' }}>NEXUS</span>
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>BOM ERP</span>
                        </Link>
                    </div>
                    <div className="button">{auth ? <button className="btn logout" onClick={onLogout}>로그아웃</button> : <Link to='/' className="btn login">로그인</Link>}</div>
                </div>

            </div >
            <div className="space"></div>

        </>
    );
};

export default HeaderComponent;