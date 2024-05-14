// LabelContent2 컴포넌트
import React, { useEffect, useState } from "react";
import { useImageData } from "./ImageContext";
import axios from "axios";
import "react-visual-grid/dist/react-visual-grid.css";
import { Grid } from "react-visual-grid";

export default function LabelContent2({ filterLabel }) {
  const { imageData, setImageData } = useImageData();
  const [fetchAttempted, setFetchAttempted] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      const endpoint =
        filterLabel === "Filtering" ? "/api/all" : "/api/filter";
      try {
        const response = await axios.get(`http://localhost:8000${endpoint}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            Label: filterLabel,
          },
        });

        setImageData(response.data);

        const formattedGroups = response.data.map((image, index) => ({
          src: image.image_path,
          alt: `Image ${index + 1}`,
        }));

        setFetchAttempted(true);
      } catch (error) {
        console.error("Failed to fetch images:", error);
        window.location.href = "/loginandsignup";
      }
    };

    if (!fetchAttempted || imageData.length === 0) {
      fetchImages();
    }
  }, [filterLabel, setImageData, imageData.length, fetchAttempted]);

  const images = imageData.map((image, index) => ({
    src: image.image_path,
    alt: `Image ${index + 1}`,
  }));

  return (
    <div className="grid-container" style={{ width: "100vw" }}>
      <Grid images={images} width={1770} height={800} showProgressBar={false} />
    </div>
  );
}