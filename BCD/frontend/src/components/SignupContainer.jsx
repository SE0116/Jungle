import React from "react";
import "./SignupContainer.css";
import SignupForm from "./SignupForm";

function SignupContainer(props) {
  return (
    <div className="signup-container">
      <div className={"logo"}> 붙이다.</div>
      <SignupForm mode={props.mode} />
    </div>
  );
}

export default SignupContainer;
