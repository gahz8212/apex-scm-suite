import React from 'react';
import { Link } from 'react-router-dom'

type Props = {
    auth: { id: number | '', name: string; role?: string } | null;
    onLogout: () => void;
}

const HeaderComponent: React.FC<Props> = ({ auth, onLogout }) => {
    return (
        <>
            <div className='headerContainer'>
                <div className="headerWraper">

                    <div className="logo">
                        <Link to={auth ? '/home' : '/'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.5px' }}>APEX</span>
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>SCM SUITE</span>
                        </Link>
                    </div>
                    <div className="button">
                        {auth ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '0.88rem', color: '#475569', fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                                    <span style={{
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        padding: '2px 7px',
                                        borderRadius: '4px',
                                        background: auth.role === 'ADMIN' ? '#fee2e2' : auth.role === 'MANAGER' ? '#fef3c7' : '#e2e8f0',
                                        color: auth.role === 'ADMIN' ? '#b91c1c' : auth.role === 'MANAGER' ? '#b45309' : '#475569',
                                        marginRight: '6px',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {auth.role || 'USER'}
                                    </span>
                                    {auth.name}님
                                </span>
                                <button className="btn logout" onClick={onLogout}>로그아웃</button>
                            </div>
                        ) : (
                            <Link to='/' className="btn login">로그인</Link>
                        )}
                    </div>
                </div>

            </div >
            <div className="space"></div>

        </>
    );
};

export default HeaderComponent;