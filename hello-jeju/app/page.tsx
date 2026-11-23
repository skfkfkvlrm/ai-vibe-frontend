import Image from "next/image";

export default function Home() {
  return (
    <div>
      <p>제주도 여행 홈페이지입니다.</p>
      <div>
        <a href='/about'>제주도 소개</a><br />
        <a href='/pic'>제주도 사진</a>
      </div>
    </div>
  );
}
