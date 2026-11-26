"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Movie {
    id: number;
    title: string;
    director: string;
    poster: string;
    actor: string;
    count: string;
}

// 포스터는 public/image 의 이미지를 표시하고, 로드에 실패하면 제목이 적힌 대체 박스가 나옵니다.
// 원본 이미지가 가로 200px이라 그 이상 키우면 깨져 보입니다.
function Poster({ src, title }: { src: string; title: string }) {
    const [failed, setFailed] = useState(false);
    const box = "block w-[200px] aspect-[200/285] rounded-lg";

    if (failed) {
        return (
            <div className={`${box} flex items-center justify-center bg-gray-300 p-2 text-center text-gray-600`}>
                {title}
            </div>
        );
    }
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={`${title} 포스터`}
            onError={() => setFailed(true)}
            className={`${box} object-cover`} />
    );
}

export default function MoviePage() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [query, setQuery] = useState('');

    async function loadMovies() {
        const response = await fetch('/api/movie');
        setMovies(await response.json());
    }

    async function searchMovie() {
        const response = await fetch(`/api/movie?query=${encodeURIComponent(query)}`);
        setMovies(await response.json());
    }

    useEffect(() => {
        loadMovies();
    }, []);

    return (
        <div className="mx-auto max-w-[760px] px-5 py-8">
            <h1 className="mb-6 text-3xl font-bold">🎬 영화 목록</h1>
            <div className="mb-8 flex gap-2">
                <input type="text" placeholder="제목 또는 감독을 입력해주세요."
                    value={query} onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') searchMovie(); }}
                    className="flex-1 rounded-lg border border-gray-400/60 bg-transparent px-3 py-2 outline-none focus:border-blue-500" />
                <button onClick={searchMovie}
                    className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
                    검색
                </button>
            </div>
            <ul className="grid grid-cols-[repeat(3,200px)] justify-center gap-6">
                {movies.map((m) => (
                    <li key={m.id}
                        className="flex flex-col overflow-hidden rounded-xl border border-gray-400/40 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                        <Link href={`/movie/${m.id}`} className="flex flex-1 flex-col">
                            <Poster src={m.poster} title={m.title} />
                            <div className="flex flex-1 flex-col gap-1 p-3 text-sm">
                                <h3 className="text-base font-semibold leading-snug">{m.title}</h3>
                                <p className="opacity-70">감독 · {m.director}</p>
                                <p className="opacity-70">주연 · {m.actor}</p>
                                <p className="mt-auto pt-1 font-medium text-blue-600">관객 {m.count}명</p>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
            {movies.length === 0 && <p className="py-10 text-center opacity-60">검색 결과가 없습니다.</p>}
            <a href="/" className="mt-8 inline-block rounded-lg border border-gray-400/60 px-4 py-2 hover:bg-gray-400/10">
                돌아가기
            </a>
        </div>
    );
}
