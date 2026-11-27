"use client"
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <h1>어서오세요!
        <p>천사무엘님</p>
        <div>
          <a href='/login'>로그인</a><br />
          <a href='/register'>회원가입</a><br />
          <a href='/forgot-password'>비밀번호 찾기</a><br />
          <a href="/about">홈페이지 소개</a><br />
          <a href="/profile">주인장 소개</a><br />
          <a href='/pic'>사진</a><br />
          <a href="/blog">블로그</a><br />
          <a href='/products'>제품</a><br />
          <a href='/hello'>인사</a><br />
          <a href='/address'>주소</a><br />
          <a href='/health'>건강</a><br />
          <a href='/dashboard'>대시보드</a><br />
          <a href='/calc'>계산기</a><br />
          <a href='/lib'>비밀</a><br />
          <a href='/cats'>고양이</a><br />
          <a href='/dogs'>강아지</a><br />
          <a href='/posts'>게시글</a><br />
          <a href='/taxi'>택시</a><br />
          <a href='/starbucks'>스타벅스</a><br />
        </div>
      </h1>
    </div>
  );
}
