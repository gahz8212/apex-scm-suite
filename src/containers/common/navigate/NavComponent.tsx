import React from 'react';

type Props = {
    page: string;
    changePage: (page: string) => void;
};

const NavComponent: React.FC<Props> = ({ page, changePage }) => {
    return (
        <ul className="nav">
            <li className={page === 'Home' ? 'selected' : ''} onClick={() => changePage('Home')}>
                Dashboard
            </li>
            <li className={page === 'Export' ? 'selected' : ''} onClick={() => changePage('Export')}>
                Export Logistics
            </li>
            <li className={page === 'Settings' ? 'selected' : ''} onClick={() => changePage('Settings')}>
                BOM Management
            </li>
            <li className={page === 'View' ? 'selected' : ''} onClick={() => changePage('View')}>
                Item Master
            </li>
        </ul>
    );
};

export default NavComponent;