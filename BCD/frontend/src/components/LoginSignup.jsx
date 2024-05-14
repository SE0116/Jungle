import React, { useState, useEffect } from "react";
import NavbarBefore from "./NavbarBefore";
import LoginContainer from "./LoginContainer";
import SignupContainer from "./SignupContainer";
import bgImage from "./content/background.jpg";
import "./LoginSignup.css";

function LoginSignup() {
  const [isVisible, setIsVisible] = useState(false);
  const [mode, setMode] = useState("login");

  const changeMode = (mode) => {
    setMode("signup");
  };

  useEffect(() => {
    setIsVisible(true);
  }, []); // 컴포넌트가 마운트되면 페이드 인

  return (
    <div className="login-signup-container">
      <NavbarBefore />
      <div className={`login-signup ${isVisible ? "show" : ""}`}>
        $
        {mode === "login" ? (
          <LoginContainer mode={changeMode} />
        ) : (
          <SignupContainer mode={changeMode} />
        )}
      </div>
    </div>
  );
}

export default LoginSignup;
