import { notFound } from "next/navigation";

const PLACES: Record<string, { image: string; msg: string }> = {
    '1': { image: 'hamduck.jpg', msg: '함덕해수욕장 소개' },
    '2': { image: 'woljeongri.jpg', msg: '월정리 해변 소개' },
    '3': { image: 'sehwa.jpg', msg: '세화 해변 소개' },
};

export default async function DetailPlacePage(
    { params, }: {
        params: Promise<{ placeId: string }>
    }
) {
    const placeId = (await params).placeId;
    const place = PLACES[placeId];
    if (!place) {
        notFound();
    }
    return (
        <div>
            <h1><p>{placeId}. {place.msg}</p></h1><br />
            <img src={`/images/${place.image}`} width={300} /><br />
            <button><a href='/place'>돌아가기</a></button>
        </div>
    );
}
