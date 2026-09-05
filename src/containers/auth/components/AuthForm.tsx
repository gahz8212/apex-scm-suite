import React from 'react';
import Styled, { css } from 'styled-components'
import { Link } from 'react-router-dom';
type Props = {
    type: string;
    error: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    form: { email: string, password: string, name?: string }
    onSubmit: () => void;
}
const StyledButton = Styled.button <{ option: string }>`
    ${props => props.option === 'login' ? css`
    background:darkcyan;
    &:hover{
        background:cyan;
    }
    ` : css`
    background:darkgreen;
    &:hover{
        background:green;
    }
    `}
`
const StyledFooter = Styled.div`
text-align:right;
padding:10px;
`
const AuthForm: React.FC<Props> = ({ type, form, onChange, onSubmit, error }) => {
    return (
        <form className='authForm' onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
        }}>
            <div className='title'>

                {type}
            </div>
            <div className="formContainer">

                <div className="inputs">
                    <input type="email" placeholder='이메일 입력' name="email" value={form.email} onChange={onChange} autoComplete='off' />
                    {type === 'join' && <input type="text" placeholder='이름 입력' name='name' value={form.name} onChange={onChange} />}
                    <input type="password" placeholder='비밀번호 입력' name="password" value={form.password} onChange={onChange} />
                </div>
                <div>
                    <StyledButton type='submit' option={type}>{type}</StyledButton>
                </div>
            </div>
            <StyledFooter>{type === 'join' ? <Link to='/'>로그인</Link> : <Link to='/join'>회원가입</Link>}</StyledFooter>
            {error && <div className="errorMessage">{error}</div>}
        </form>
    );
};

export default AuthForm;