"use client"
import { useState, useEffect } from 'react';

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
                    type="text" placeholder="번호를 입력하세요"
                    value={keyword} onChange={(e) => setKeyword(Number(e.target.value))}>
                </input></p>
            <button onClick={loadPosts}
                style={{
                    backgroundColor: "#000fff",
                    color: "#ffffff",
                    padding: "10px 20px"
                }}>조회</button>
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
        </div >
    );
}