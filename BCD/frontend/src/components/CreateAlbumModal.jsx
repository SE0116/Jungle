import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CreateAlbumModal.css'; // CSS 파일 임포트

function CreateAlbumModal({ onClose }) {
  const [albumTitle, setAlbumTitle] = useState('');
  const [selectedGroups, setSelectedGroups] = useState([]);
  const groups = ['Car', 'Inside', 'Animal', 'Vehicle', 'Person', 'Electronic', 'Dish', 'Food', 'Sport', 'Landscape', 'Accessory', 'ETC'];
  const navigate = useNavigate();

  const handleTitleChange = (e) => {
    setAlbumTitle(e.target.value);
  };

  const handleGroupChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedGroups([...selectedGroups, value]);
    } else {
      setSelectedGroups(selectedGroups.filter(group => group !== value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const albumData = {
      album_title: albumTitle,
      album_filter: selectedGroups
    };

    try {
      const response = await axios.post('http://localhost:8000/api/album/create', albumData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      console.log('서버 응답:', response.data);
      navigate('/book');
      localStorage.setItem('album_title', albumTitle);
      onClose(); // 모달 닫기
    } catch (error) {
      console.error('앨범 생성 실패:', error.response ? error.response.data : error);
    }
  };

  return (
    <div className="createAlbumModal-overlay">
      <div className="createAlbumModal-container">
        <form onSubmit={handleSubmit}>
          <div className="createAlbumModal-formGroup">
            <label className="createAlbumModal-label" htmlFor="albumTitle">앨범 제목:</label>
            <input
              type="text"
              id="albumTitle"
              value={albumTitle}
              onChange={handleTitleChange}
              className="createAlbumModal-input"
            />
          </div>
          <div className="createAlbumModal-formGroup">
            {groups.map(group => (
              <div key={group} className="createAlbumModal-checkboxGroup">
                <input
                  type="checkbox"
                  id={group}
                  value={group}
                  checked={selectedGroups.includes(group)}
                  onChange={handleGroupChange}
                  className="createAlbumModal-checkbox"
                />
                <label className="createAlbumModal-checkboxLabel" htmlFor={group}>{group}</label>
              </div>
            ))}
          </div>
          <div className="createAlbumModal-buttonGroup">
            <button className="createAlbumModal-button" type="submit">앨범 생성</button>
            <button className="createAlbumModal-button closeButton" type="button" onClick={onClose}>닫기</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateAlbumModal;
