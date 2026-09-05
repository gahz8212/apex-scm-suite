import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import HeaderComponent from './HeaderComponent';
import { response } from '../../../store/slices/authSlice';
import { authActions } from '../../../store/slices/authSlice';
import { PageActions } from '../../../store/slices/pageSlice';

const HeaderContainer = () => {
    const dispatch = useDispatch();
    const { auth } = useSelector(response);
    const onLogout = () => {
        const { logout } = authActions;
        dispatch(logout())
        dispatch(PageActions.initPage())
    }
    return (
        <div>
            <HeaderComponent auth={auth} onLogout={onLogout} />
        </div>
    );
};

export default HeaderContainer;