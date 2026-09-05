import React from 'react';
import { Link } from 'react-router-dom';
import style, { css } from 'styled-components'

const ButtonStyle = css<{ cyan: string, green: string, orange: string }>`
border:none;
outline:none;
padding:.5rem 1rem;
border-radius:8px;
// background:red;
color:white;
font-weight:700;
font-size:1.1rem;
// ${props => props.cyan && css`background:cyan`}
${props => props.green && css`background:green`}
${props => props.orange && css`background:orange`}

`
const StyledButton = style.button<{ cyan: string, green: string, orange: string }>`${ButtonStyle} `;
const StyledLink = style(Link) <{ cyan: string, green: string, orange: string }>`${ButtonStyle} `;
const Button = (props: any) => {
    return props.to ?
        <StyledLink {...props} cyan={props.cyan ? 1 : 0} green={props.green ? 1 : 0} orange={props.orange ? 1 : 0}></StyledLink> :
        <StyledButton  {...props} ></StyledButton>

};

export default Button;