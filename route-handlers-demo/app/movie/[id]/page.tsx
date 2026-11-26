import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { movie } from "../../api/movie/data";

type Props = { params: Promise<{ id: string }> };

async function MovieDetail({ params }: Props) {
    const { id } = await params;
    const m = movie.find((item) => item.id === parseInt(id));
    if (!m) notFound();

    const actors = (m.actor ?? '').split(',').map((a) => a.trim()).filter(Boolean);

    return (
        <div className="mx-auto max-w-[760px] px-5 py-8">
            <Link href="/movie" className="mb-6 inline-block opacity-70 hover:opacity-100">← 영화 목록</Link>
            <div className="flex flex-col gap-8 sm:flex-row">
                {/* 원본 이미지가 가로 200px이라 크게 키우지 않습니다. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.poster} alt={`${m.title} 포스터`}
                    className="aspect-[200/285] w-[200px] shrink-0 rounded-xl object-cover shadow-lg" />
                <div className="flex-1">
                    <h1 className="mb-1 text-3xl font-bold leading-snug">{m.title}</h1>
                    <p className="mb-6 font-medium text-blue-600">누적 관객 {m.count}명</p>
                    <dl className="grid grid-cols-[80px_1fr] gap-y-3">
                        <dt className="opacity-60">감독</dt>
                        <dd>{m.director}</dd>
                        <dt className="opacity-60">주연</dt>
                        <dd className="flex flex-wrap gap-2">
                            {actors.map((a) => (
                                <span key={a} className="rounded-full border border-gray-400/50 px-3 py-0.5 text-sm">{a}</span>
                            ))}
                        </dd>
                    </dl>
                </div>
            </div>
        </div>
    );
}

export default function MovieDetailPage({ params }: Props) {
    return (
        <Suspense fallback={<p className="py-10 text-center opacity-60">불러오는 중...</p>}>
            <MovieDetail params={params} />
        </Suspense>
    );
}
