import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
    page: string;
    changePage: (page: string) => void;
}
const NavComponent: React.FC<Props> = ({ visible, setVisible, page, changePage }) => {
    return (

        <>
            <ul className={`nav ${visible ? 'visible' : ''}`}>
                <li className={`${page === 'Home' ? "selected" : ''}`} onClick={() => changePage('Home')}>Home</li>
                <li className={`${page === 'Export' ? "selected" : ''}`} onClick={() => changePage('Export')}>Exports Manage</li>
                <li className={`${page === 'Settings' ? "selected" : ''}`} onClick={() => changePage('Settings')}>Relation Settings</li>
                <li className={`${page === 'View' ? "selected" : ''}`} onClick={() => changePage('View')}>Item Settings</li>
                <li className={`${page === 'Search' ? "selected" : ''}`} onClick={() => { setVisible(!visible) }}>Search</li>
            </ul>
        </>
    );
};

export default NavComponent;