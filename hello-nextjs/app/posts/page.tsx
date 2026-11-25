"use client"
import { useState, useEffect } from 'react';
import { inputStyle, buttonStyle, layoutStyle } from "../_lib/styles";

type Post = {
    userId: number;
    id: number;
    title: string;
    body: string;
}


export default function PostsPage() {
    const [searchType, setSearchType] = useState<"userId" | "id">("userId");
    const [keyword, setKeyword] = useState<number>(0);
    const [posts, setPosts] = useState<Post[]>([]);

    async function loadPosts() {
        const query = keyword > 0 ? `?${searchType}=${keyword}` : "";
        const response = await fetch(
            `https://jsonplaceholder.typicode.com/posts${query}`
        );
        setPosts(await response.json());
    }
    useEffect(() => {
        loadPosts();
    }, [])
    return (
        <div>
            <h1>게시글</h1>
            <p>
                <select value={searchType}
                    onChange={(e) => setSearchType(e.target.value as "userId" | "id")}>
                    <option value={'userId'}>사용자 번호</option>
                    <option value={'id'}>게시글 번호</option>
                </select>
                <input
                    type="number" placeholder="번호를 입력하세요" min={0}
                    value={keyword} onChange={(e) => setKeyword(Number(e.target.value))}
                    style={inputStyle}>
                </input></p>
            <button onClick={loadPosts}
                style={buttonStyle}>조회</button>
            {
                posts.length === 0 ? <p>게시글이 없습니다.</p> : (
                    <ul>
                        {posts.map((post) => (
                            <li key={post.id}>
                                <p>[{post.userId}번 사용자 / {post.id}번 글] {post.title}</p>
                                <p>{post.body}</p>
                            </li>
                        ))}
                    </ul>
                )
            }
            <button style={buttonStyle}><a href='/'>돌아가기</a></button>
        </div >
    );
}