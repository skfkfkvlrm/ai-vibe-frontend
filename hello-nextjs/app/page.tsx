import Image from "next/image";

export default function Home() {
  return (
    <div>
      <h1>어서오세요!
        <p>천사무엘님</p>
        <div>
          <a href="/about">홈페이지 소개</a><br />
          <a href="/profile">주인장 소개</a><br />
          <a href='/pic'>사진</a><br />
          <a href="/blog">블로그</a><br />
          <a href='/products'>제품</a><br />
          <a href='/hello'>인사</a><br />
          <a href='/address'>주소</a><br />
          <a href='/health'>건강</a><br />
        </div>
      </h1>
    </div>
  );
}
