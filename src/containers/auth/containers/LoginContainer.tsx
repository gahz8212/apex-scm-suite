import React, { useEffect } from 'react';
import AuthTemplate from '../components/AuthTemplate';
import AuthForm from '../components/AuthForm';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authActions } from '../../../store/slices/authSlice';

import { response } from '../../../store/slices/authSlice';
const LoginContainer = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    // const { form } = useSelector((state: RootState) => ({ form: state.auth.login }))
    const { error, message, auth, loginData } = useSelector(response)
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { changeField } = authActions;
        const { name, value } = e.target;
        dispatch(changeField({ form: 'login', key: name, value }))
    }
    const login = () => {
        if (!loginData.email || !loginData.password) return;
        console.log(loginData.email, loginData.password)

        dispatch(authActions.login({ email: loginData.email, password: loginData.password }))

    }
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => { dispatch(authActions.errorReset()) }, 2000)
            return () => clearTimeout(timer);
        }
        if (message === 'login_ok') {
            dispatch(authActions.check())
        }
    }, [dispatch, error, message])

    useEffect(() => {
        if (auth) {
            navigate('/home')
            try {
                localStorage.setItem('user', JSON.stringify(auth))
            } catch (e) {
                console.error('local storage is not working.')
            }
        }
    }, [auth, navigate])
    useEffect(() => {
        return () => {
            dispatch(authActions.initForm('login'))
        }
    }, [dispatch])
    return (
        <AuthTemplate>
            <AuthForm type='login' onChange={onChange} form={loginData} onSubmit={login} error={error} />
        </AuthTemplate>
    );
};

export default LoginContainer;