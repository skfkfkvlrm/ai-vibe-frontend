import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "천사무엘의 블로그",
    description: "블로그 페이지입니다."
}

function getRandonInt(count: number) {
    return Math.floor(Math.random() * count);
}

export default async function BlogLayout({ children }: { children: React.ReactNode }) {
    // await new Promise((resolve) => setTimeout(resolve, 5000));
    const random = getRandonInt(2);
    if (random === 0) {
        throw new Error('블로그를 로드할 수 없습니다.');
    }
    return (
        <div>
            <h1>블로그입니다.</h1>
            {children}
        </div>
    );
}
