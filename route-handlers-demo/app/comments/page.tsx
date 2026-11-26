"use client";

import { useState, useEffect } from "react";
interface Comment {
    id: number;
    text: string;
}

export default function CommentsPage() {
    const [comments, setComments] = useState<Comment[]>([]);

    async function loadComments() {
        const response = await fetch('/api/comments');
        const data = await response.json();
        setComments(data);
    }

    useEffect(() => {
        loadComments();
    }, []);

    return (
        <div>
            <h1>Comments</h1>
            <ul>
                {comments.map((comment) => (
                    <li key={comment.id}>
                        {comment.text}
                    </li>
                ))}
            </ul>
            <button><a href="/">돌아가기</a></button>
        </div>
    );
}