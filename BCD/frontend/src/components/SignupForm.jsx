import React, { useState } from "react";
import "./SignupForm.css";

function SignupForm() {
  const [formData, setFormData] = useState({
    username: "",
    password1: "",
    password2: "",
    email: "",
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // JSON으로 변환하여 서버에 전송
    try {
      const response = await fetch("http://localhost:8000/signup/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("회원가입 성공");
        // 성공 처리 로직 (예: 로그인 페이지로 리다이렉트)
        window.location.href = "/loginandsignup";
      } else {
        alert("회원가입 실패");
        // 실패 처리 로직
      }
    } catch (error) {
      alert("회원가입 중 에러 발생", error);
    }
  };

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      <input
        type="text"
        id="username"
        name="username"
        placeholder="아이디"
        className="signup-input"
        value={formData.username}
        onChange={handleInputChange}
      />
      <input
        type="password"
        id="password1"
        name="password1"
        placeholder="비밀번호"
        className="signup-input"
        value={formData.password1}
        onChange={handleInputChange}
      />
      <input
        type="password"
        id="password2"
        name="password2"
        placeholder="비밀번호 확인"
        className="signup-input"
        value={formData.password2}
        onChange={handleInputChange}
      />
      <input
        type="email"
        id="email"
        name="email"
        placeholder="이메일"
        className="signup-input"
        value={formData.email}
        onChange={handleInputChange}
      />
      <div className="button-container">
        <button type="submit" className="confirm-button">
          회원가입
        </button>
      </div>
    </form>
  );
}

export default SignupForm;
