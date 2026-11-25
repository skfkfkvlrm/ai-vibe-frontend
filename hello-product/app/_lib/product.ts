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
        description: 'ASUS ROG Strix G15',
        image: 'ASUS ROG Strix G15.jpg'
    },
    {
        id: 2,
        name: 'Buds 3 pro',
        price: 10000,
        description: 'Buds 3 pro',
        image: 'Buds 3 pro.jpg'
    },
    {
        id: 3,
        name: 'LG gram 14',
        price: 10000,
        description: 'LG gram 14',
        image: 'LG gram 14.jpg'
    },
    {
        id: 4,
        name: 'MacBook Air M1 13',
        price: 10000,
        description: 'MacBook Air M1 13',
        image: 'MacBook Air M1 13.jpg'
    },
    {
        id: 5,
        name: 'ThinkPad T14',
        price: 10000,
        description: 'ThinkPad T14',
        image: 'ThinkPad T14.jpg'
    }
]