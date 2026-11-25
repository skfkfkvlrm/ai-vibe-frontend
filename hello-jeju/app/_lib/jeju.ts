export type Travel = {
    id: number;
    name: string;
    description: string;
    image: string;
}

export const travels: Travel[] = [
    {
        id: 1,
        name: '함덕해수욕장',
        description: '해수욕장',
        image: 'hamduck.jpg'
    },
    {
        id: 2,
        name: '월정리 해변',
        description: '월정리',
        image: 'woljeonri.jpg'
    },
    {
        id: 3,
        name: '세화 해변',
        description: '세화',
        image: 'sehwa.jpg'
    }
]