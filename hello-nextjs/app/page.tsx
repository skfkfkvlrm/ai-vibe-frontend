import Image from "next/image";

export default function Home() {
  return (
    <div>
      <h1>어서오세요!
        <p>천사무엘님</p>
        <p>박찬호님</p> <img src="lim.jpg" width={300} /> <img src="park.jpg" width={300} /><br />
        <div>
          <a href="/about">홈페이지 소개</a><br />
          <a href="/profile">주인장 소개</a>
        </div>
      </h1>
    </div>
  );
}
