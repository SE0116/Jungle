import React, { useState } from 'react';
import './MainPage.css';
import MainButton from './MainButton';
import bgImage from './content/background.jpg'
import NavbarBefore from './NavbarBefore';

function MainPage() {
    
    return (
        <div className="main-container">
            <NavbarBefore/>
            <div className={'title-container'}>
                <div className={'title'}> 붙이다. </div>
                <div className={'subTitle'}> 우리의 추억을 만들어주는 서비스 </div>
            </div>
            <MainButton/>
        </div>
    );
}

export default MainPage;
