"use client";
import { useState } from "react";

export default function StarbucksPage() {
    const [keyword, setKeyword] = useState<string>('');
    const noteBooks = ['맥북', '그램', '갤북'];

    return (
        <div>
            <h1>노트북 입력:
                <input type="text" placeholder="키를 입력해주세요"
                    value={keyword} onChange={(e) => setKeyword(e.target.value)}
                    style={{ padding: "3px 2px", border: "2px solid #999" }}>
                </input>
            </h1>
            <h1>입장가능 여부</h1>
            <h1>{noteBooks.includes(keyword) ? `${keyword}는 입장가능합니다.` : `${keyword}는 입장불가합니다.`}</h1>
            <button><a href='/'>돌아가기</a></button>
        </div>
    );
}