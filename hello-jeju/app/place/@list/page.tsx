import Link from 'next/link';
import { travels } from '../../_lib/jeju';

export default function ListPage() {
    return (
        <div>
            <h1>여행지 리스트입니다.</h1>
            <ul>
                {travels.map((travel) => (
                    <li key={travel.id}>
                        <Link href={`/place/${travel.id}`}>
                            {travel.name}
                        </Link>
                    </li>
                ))}
            </ul>
            <button><a href='/'>돌아가기</a></button>
        </div>
    );
}