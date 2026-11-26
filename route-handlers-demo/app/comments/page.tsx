"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
interface Comment {
    id: number;
    text: string;
}

export default function CommentsPage() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [query, setQuery] = useState('');
    const [newText, setNewText] = useState('');

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

    async function addComment() {
        const text = newText.trim();
        if (!text) return;
        const response = await fetch('/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
        });
        if (response.ok) {
            setNewText('');
            setQuery('');
            await loadComments();
        }
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
            <div style={{ marginTop: "10px" }}>
                <input type='text' placeholder="댓글을 입력해주세요."
                    value={newText} onChange={(e) => setNewText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addComment(); }}
                    style={{ outline: "2px solid #999", padding: "3px 2px" }} />
                <button onClick={addComment} style={{ outline: "2px solid #999", padding: "3px 3px", }}>등록</button>
            </div>
            <ul>
                {comments.map((comment) => (
                    <li key={comment.id}>
                        {comment.text}
                    </li>
                ))}
            </ul>
            <button><Link href="/">돌아가기</Link></button>
        </div >
    );
}