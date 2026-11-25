export type Product = {
    id: number;
    name: string;
    price: number;
    description: string;
    image: string;
}

export const products: Product[] = [
    {
        id: 1,
        name: 'ASUS ROG Strix G15',
        price: 10000,
        description: 'AMD의 고성능 라이젠 시피유 및 라데온 그래픽카드가 탑재된 노트북',
        image: '/image/ASUS ROG Strix G15.jpg'
    },
    {
        id: 2,
        name: 'Buds 3 pro',
        price: 10000,
        description: '전체적으로 에어팟과 비슷한 스템형 디자인이 되었다',
        image: '/image/Buds 3 pro.jpg'
    },
    {
        id: 3,
        name: 'LG gram 14',
        price: 10000,
        description: '1kg 미만의 가벼운 무게와 화이트 감성의 예쁜 디자인이 호평받으면서 큰 인기를 끌고 있다',
        image: '/image/LG gram 14.jpg'
    },
    {
        id: 4,
        name: 'MacBook Air M1 13',
        price: 10000,
        description: 'Apple이 2020년 11월 11일, Apple 이벤트에서 공개한 macOS 노트북 컴퓨터',
        image: '/image/MacBook Air M1 13.jpg'
    },
    {
        id: 5,
        name: 'ThinkPad T14',
        price: 10000,
        description: '저소음, 가벼운 편이지만, HDR을 지원하지 않는다',
        image: '/image/ThinkPad T14.jpg'
    }
]