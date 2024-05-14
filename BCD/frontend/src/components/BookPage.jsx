import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import HTMLFlipBook from "react-pageflip";
import { useNavigate } from "react-router-dom";
import "./BookPage.css";
import PageCover from "./PageCover";
import Page from "./Page";
import EditModal from "./EditModal";
import bgImage from "./content/background.jpg";

function BookPage(props) {
  const [albumData, setAlbumData] = useState({ albumTitle: "", photos: [] });
  const [isLoading, setIsLoading] = useState(true); // 데이터 로딩 상태 관리
  const [error, setError] = useState(null); // 에러 상태 관리
  const [page, setPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTexts, setEditTexts] = useState({});
  const flipBook = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true); // 로딩 시작
    const fetchAlbumData = async () => {
      try {
        const albumTitle = localStorage.getItem("album_title");
        const response = await axios.get(
          `http://localhost:8000/api/album/data?album_title=${encodeURIComponent(
            albumTitle
          )}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        setAlbumData(response.data);
        setIsLoading(false); // 로딩 완료
      } catch (error) {
        console.error("Failed to fetch album data:", error);
        setError(error); // 에러 설정
        setIsLoading(false); // 로딩 완료
      }
    };
    fetchAlbumData();
  }, []);

  useEffect(() => {
    const pageCount = flipBook.current?.pageFlip()?.getPageCount();
    setPage(pageCount ? pageCount : 0);
  }, [albumData]);

  // 생략된 saveTexts 함수 및 다른 함수들...

  // 서버로부터 앨범 데이터를 가져오는 useEffect
  useEffect(() => {
    const fetchAlbumData = async () => {
      try {
        const albumTitle = localStorage.getItem("album_title");
        const response = await axios.get(
          `http://localhost:8000/api/album/data?album_title=${encodeURIComponent(
            albumTitle
          )}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`, // 인증 토큰 추가
            },
          }
        );
        setAlbumData(response.data);
        console.log("Fetched album data:", response.data);
      } catch (error) {
        console.error("Failed to fetch album data:", error);
        alert("Failed to fetch album data:", error);
      }
    };

    fetchAlbumData();
  }, []);

  useEffect(() => {
    const pageCount = flipBook.current?.pageFlip()?.getPageCount();
    if (pageCount) {
      setPage(pageCount);
    }
  }, [albumData]); // albumData 의존성 추가

  const openEditModal = () => {
    setIsModalOpen(true);
  };

  const saveTexts = async (leftText, rightText) => {
    // 변경된 텍스트를 서버로 전송하는 로직
    const payload = {
      page: page,
      leftText: leftText,
      rightText: rightText,
    };

    try {
      // 인증 토큰을 포함한 헤더를 설정합니다.
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`, // 인증 토큰 추가
        },
      };

      // 여기에 실제 업데이트를 위한 API 엔드포인트와 HTTP 메서드를 교체하세요.
      // 이 예제에서는 PATCH 메서드를 사용하고, 페이지 번호와 텍스트를 전송합니다.
      await axios.patch(
        "여기에 실제 페이지 텍스트 업데이트 API URL 입력",
        payload,
        config
      );
      alert("텍스트 업데이트 성공");

      // 성공적으로 서버에 데이터를 업데이트한 후, 프론트엔드 상태도 업데이트
      setEditTexts({ ...editTexts, [page]: leftText, [page + 1]: rightText });
    } catch (error) {
      console.error("텍스트 업데이트 실패:", error);
      // alert('텍스트 업데이트 실패');
      setEditTexts({ ...editTexts, [page]: leftText, [page + 1]: rightText });
    }

    setIsModalOpen(false);
  };

  // "Edit Image" 버튼 클릭 시 /edit 경로로 이동하는 함수
  const navigateToEdit = () => {
    navigate("/edit");
  };

  // 앨범 리스트로 돌아가기
  const goBackToAlbumList = () => {
    navigate("/albumlist");
  };

  if (isLoading) {
    return <div>Loading...</div>; // 로딩 중 UI 표시
  }

  if (error) {
    return <div>Error loading album data. Please try again.</div>; // 에러 발생 시 UI 표시
  }

  return (
    <div
      style={{
        backgroundImage: `url(${bgImage})`,
        width: "100%",
        height: "120vh",
      }}
    >
      <button className="book-button" onClick={openEditModal}>
        글 수정
      </button>
      <button className="book-button" onClick={navigateToEdit}>
        이미지 수정
      </button>
      <button
        className="book-button"
        onClick={goBackToAlbumList}
        style={{ float: "right" }}
      >
        앨범 목록
      </button>
      <HTMLFlipBook
        width={620}
        height={580}
        size="stretch"
        minWidth={315}
        maxWidth={1000}
        minHeight={400}
        maxHeight={1533}
        maxShadowOpacity={0.5}
        showCover={true}
        mobileScrollSupport={true}
        onFlip={(e) => setPage(e.data)}
        className="demo-book"
        ref={flipBook}
      >
        <PageCover>{albumData.albumTitle || "Album Title"}</PageCover>
        {albumData.photos &&
          albumData.photos.map((photo, index) => (
            <Page
              key={index}
              number={index + 1}
              text={editTexts[index + 1] || photo.text}
              imageUrl={photo.imageUrl}
              timestamp={photo.timestamp}
            />
          ))}
        <PageCover>THE END</PageCover>
      </HTMLFlipBook>

      {isModalOpen && (
        <EditModal
          isOpen={isModalOpen}
          leftPageText={editTexts[page] || ""}
          rightPageText={editTexts[page + 1] || ""}
          onSave={saveTexts}
          onCancel={() => setIsModalOpen(false)}
          currentPage={page}
        />
      )}
    </div>
  );
}

export default BookPage;
