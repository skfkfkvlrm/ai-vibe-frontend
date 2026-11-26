"use client";

import { useState, useEffect } from "react";
interface Comment {
    id: number;
    text: string;
}

export default function CommentsPage() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [query, setQuery] = useState('');

    async function loadComments() {
        const response = await fetch('/api/comments');
        const data = await response.json();
        setComments(data);
    }

    async function searchComment() {
        const response = await fetch(`/api/comments?query=${query}`);
        const data = await response.json();
        setComments(data);
    }

    useEffect(() => {
        loadComments();
    }, []);

    return (
        <div>
            <h1>Comments</h1>
            <input type='text' placeholder="검색어를 입력해주세요."
                value={query} onChange={(e) => setQuery(e.target.value)}
                style={{ outline: "2px solid #999", padding: "3px 2px" }}>
            </input>
            <button onClick={searchComment} style={{ outline: "2px solid #999", padding: "3px 3px", }}>검색</button>
            <ul>
                {comments.map((comment) => (
                    <li key={comment.id}>
                        {comment.text}
                    </li>
                ))}
            </ul>
            <button><a href="/">돌아가기</a></button>
        </div >
    );
}