import React from 'react';
import './Navbar.css';
import logo from './content/logo.png';

function NavbarBefore() {
    // 이미지 클릭 처리 함수
    const handleLogoClick = () => {
        window.location.href = '/';
    }

    return (
        <div className="navbar">
            {/* 이미지에 onClick 이벤트 핸들러 추가 */}
            <img src={logo} className="navbar-logo" alt="Logo" onClick={handleLogoClick} />
        </div>
    );
}

export default NavbarBefore;
