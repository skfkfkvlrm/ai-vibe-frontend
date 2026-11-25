import Link from 'next/link';
import { travels } from '../../../_lib/jeju';

export default async function ListPage(
    { params }: { params: Promise<{ slug?: string[] }> }
) {
    const slug = (await params).slug;
    const selectedId = slug ? Number(slug[0]) : undefined;

    return (
        <div>
            <h1>여행지 리스트입니다.</h1>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {travels.map((travel) => (
                    <li key={travel.id}>
                        <Link href={`/place/${travel.id}`}
                            style={{ fontWeight: travel.id === selectedId ? 'bold' : 'normal' }}>
                            {travel.name}
                        </Link>
                    </li>
                ))}
            </ul>
            <button><a href='/'>돌아가기</a></button>
        </div>
    );
}
