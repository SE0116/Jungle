import AlbumListCard from "./AlbumListCard";

function AlbumListCarousel({ radius = 1.4, count = 4 }) {
    return Array.from({ length: count }, (_, i) => (
      <AlbumListCard
        key={i}
        url={`/image${Math.floor(i % 10) + 1}.jpeg`}
        position={[Math.sin((i / count) * Math.PI * 2) * radius, 0, Math.cos((i / count) * Math.PI * 2) * radius]}
        rotation={[0, Math.PI + (i / count) * Math.PI * 2, 0]}
      />
    ))
  }

export default AlbumListCarousel;