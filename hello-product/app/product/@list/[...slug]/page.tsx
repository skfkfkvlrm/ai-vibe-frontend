import { products } from "../../../_lib/product";
import Link from "next/link";

export default async function List(
    { params }: { params: Promise<{ slug?: string[] }> }
) {
    const slug = (await params).slug;
    const selectedId = slug ? Number(slug[0]) : undefined;

    return (
        <div>
            <h1>제품 목록입니다.</h1>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {products.map((product) => (
                    <li key={product.id}>
                        <Link href={`/product/${product.id}`}
                            style={{ fontWeight: product.id === selectedId ? 'bold' : 'normal' }}>
                            {product.name}
                        </Link>
                    </li>
                ))}
            </ul>
            <button><a href='/'>돌아가기</a></button>
        </div>
    );
}