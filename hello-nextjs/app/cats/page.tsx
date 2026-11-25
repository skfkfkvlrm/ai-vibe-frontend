"use client"
import { useState, useEffect } from "react";

type Cat = {
    id: string;
    url: string;
}

export default function CatsPage() {
    //고양이 목록
    const [cats, setCats] = useState<Cat[]>([]);
    //전체 고양이 목록 조회
    async function loadCats() {
        const response = await fetch("https://api.thecatapi.com/v1/images/search?limit=10");
        const data = await response.json();
        setCats(data);
    }
    //페이지가 처음 표시될 때 실행되는 이펙트
    useEffect(() => {
        loadCats();
    }, [])

    return (
        <div>
            <h1>캣츠입니다</h1>
            <ul>
                {cats.map((cat) => (
                    <li key={cat.id}>
                        <img src={cat.url} width={'300'}></img>
                    </li>
                ))}
            </ul>
            <button><a href='/'>돌아가기</a></button>
        </div>
    );
}