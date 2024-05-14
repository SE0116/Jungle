// LabelPage2 컴포넌트
import React, { useState } from "react";
import Navbar from "./Navbar";
import LabelContent2 from "./LabelContent2";
import LabelOverlay from "./LabelOverlay";
import "./LabelPage.css";

function LabelPage2() {
  const [filterLabel, setFilterLabel] = useState("Filtering");

  const toggleFilterLabel = () => {
    setFilterLabel((currentLabel) =>
      currentLabel === "Filtering" ? "All" : "Filtering"
    );
  };

  return (
    <div className="label-page-container">
      <Navbar />
      <LabelContent2 filterLabel={filterLabel} />
      <LabelOverlay
        onToggleFilterLabel={toggleFilterLabel}
        filterLabel={filterLabel}
      />
    </div>
  );
}

export default LabelPage2;