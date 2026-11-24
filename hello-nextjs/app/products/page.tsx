import Link from 'next/link'

export default function ProductsPage() {
    return (
        <div>
            <h1>제품</h1>
            <Link href='/products/1'>첫번째 제품</Link><br />
            <Link href='/products/2'>두번째 제품</Link><br />
            <Link href='/products/3'>세번째 제품</Link><br />
            <Link href='/products/4'>네번째 제품</Link><br />
            <Link href='/products/5'>다섯번째 제품</Link><br />
            <button><a href='/'>돌아가기</a></button>
        </div>
    );
}