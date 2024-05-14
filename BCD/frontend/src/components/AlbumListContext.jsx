import React, { createContext, useContext, useState } from 'react';


export const useAlbumList = () => useContext(AlbumListContext);

const AlbumListContext = createContext({
    hoveredCard: null, // 초기값 설정
    setHoveredCard: () => {} // 빈 함수로 초기화
  });

export const AlbumListProvider = ({ children }) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <AlbumListContext.Provider value={{ hoveredCard, setHoveredCard }}>
      {children}
    </AlbumListContext.Provider>
  );
};
