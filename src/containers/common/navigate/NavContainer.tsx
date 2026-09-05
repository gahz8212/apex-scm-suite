import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavComponent from './NavComponent';
import { PageActions, PageData } from '../../../store/slices/pageSlice';
import { useSelector, useDispatch } from 'react-redux';

const NavContainer: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentPage } = useSelector(PageData);

    const changePage = (page: string) => {
        dispatch(PageActions.changePage(page));
    };

    useEffect(() => {
        navigate(`/${currentPage}`);
        dispatch(PageActions.changePage(currentPage));
    }, [currentPage, navigate, dispatch]);

    return (
        <NavComponent page={currentPage} changePage={changePage} />
    );
};

export default NavContainer;