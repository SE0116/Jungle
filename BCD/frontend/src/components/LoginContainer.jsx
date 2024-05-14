import React from 'react';
import './LoginContainer.css';
import LoginForm from './LoginForm';

function LoginContainer(props) {
    return (
        <div className="login-container">
            <div className={'logo'}> 붙이다.</div>
            <LoginForm mode={props.mode}/>
        </div>
    );
}

export default LoginContainer;
