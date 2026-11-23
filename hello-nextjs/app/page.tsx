import Image from "next/image";

export default function Home() {
  return (
    <div>
      <h1>어서오세요!
        <p>천사무엘님</p>
        <div>
          <a href='/pic'>사진</a><br />
          <a href="/about">홈페이지 소개</a><br />
          <a href="/profile">주인장 소개</a><br />
          <a href="/blog">블로그</a>
          <a href='/products'>제품</a>
        </div>
      </h1>
    </div>
  );
}
