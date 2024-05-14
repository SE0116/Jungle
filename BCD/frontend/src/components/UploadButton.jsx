import React, { useRef } from 'react';
import "./UploadButton.css";

function UploadButton() {
  const fileInputRef = useRef(null);
  // useRef를 사용해서 파일 입력 요소를 참조

  const uploadFiles = async () => {
    const fileInput = fileInputRef.current;
    // 이벤트 리스너를 추가/제거해서 중복 이벤트 리스너 등록을 방지

    if (fileInput) {
      fileInput.setAttribute("multiple", true);
      fileInput.click();
    }
  };

  const handleChange = async () => {
    const fileInput = fileInputRef.current;
    if (fileInput) {
      const selectedFiles = fileInput.files;
      if (selectedFiles.length > 0) {
        const formData = new FormData();

        // 선택한 모든 파일을 FormData에 추가
        for (let i = 0; i < selectedFiles.length; i++) {
          formData.append("files", selectedFiles[i]);
        }

        try {
          const response = await fetch(
            "http://localhost:8000/group/album/upload",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                // 추가된 부분: 인증 토큰을 헤더에 포함시킵니다.
              },
              body: formData,
            }
          );
          console.log(response.json());
          if (response.ok) {
            alert("파일 업로드 성공!");
          } else {
            alert("파일 업로드 실패.");
          }
        } catch (error) {
          console.error("파일 업로드 중 오류 발생:", error);
        }
      }
    }
  };

  return (
    <div>
      <button className="upload-button" onClick={uploadFiles}>
        +
      </button>
      <input
        type="file"
        id="fileInput"
        multiple
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleChange}
      />
    </div>
  );
}

export default UploadButton;
