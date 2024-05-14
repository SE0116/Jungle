import React, { useState } from 'react';
import './Navbar.css';
import { useNavigate } from 'react-router-dom'; // useNavigate 훅 임포트
import logo from './content/logo.png';

function Navbar() {
    const [isNavExpanded, setIsNavExpanded] = useState(true); // 네비게이션바 확장 상태 관리

    const navigate = useNavigate(); // useNavigate 훅 사용

    const handleHomeClick = () => {
        navigate('/album');
    };

    const handleEditClick = () => {
        navigate('/edit');
    };
  
    const handleAlbumListClick = () => {
        navigate('/albumlist'); // /albumlist 경로로 이동
    };
        
    const handleAlbumCreateClick = () => {
        navigate('/labelpage2');
    };
    
    // 로그아웃 처리 함수
    const handleLogout = () => {
        // localStorage에서 항목 삭제
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_name');
        // 사용자를 /loginandsignup로 리다이렉션
        window.location.href = '/loginandsignup';
    }

    // // 로고 클릭 처리 함수
    // const handleLogoClick = () => {
    //     // 사용자를 /uploadpage로 리다이렉션
    //     window.location.href = '/uploadpage';
    // }

    // 햄버거 버튼 클릭 처리 함수
    const toggleNav = () => {
        setIsNavExpanded(!isNavExpanded); // 상태 토글
    }

    return (
        <div className="navbar">
            {/* 로고 클릭 시 handleLogoClick 함수 실행 */}
            <img src={logo} className="navbar-logo" alt="Logo" onClick={toggleNav} />
            <div className={`navbar-menu ${isNavExpanded ? 'expanded' : 'collapsed'}`}>
                <a className='link-button' onClick={handleHomeClick}>앨범 목록</a>
                <a className='link-button' onClick={handleAlbumCreateClick}>모든 사진</a>
                {/* <a className='link-button' onClick={handleAlbumListClick}>앨범 목록</a> */}
                <a className='link-button' onClick={handleEditClick}>사진 편집</a>
                <button className="logout-button" onClick={handleLogout}>로그아웃</button>
            </div>
        </div>
    );
}

export default Navbar;
