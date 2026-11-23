import { notFound } from "next/navigation";

export default async function PlaceIdPage(
    { params, }: {
        params: Promise<{ placeId: string }>
    }
) {
    const placeId = (await params).placeId;
    if (parseInt(placeId) > 3 || parseInt(placeId) < 1) {
        notFound();
    }
    let placeName = '';
    let placeImage = '';
    let placeMsg = '';
    if (placeId === '1') {
        placeName = 'hamduck';
        placeImage = 'hamduck.jpg';
        placeMsg = '함덕해수욕장 소개';
    } if (placeId === '2') {
        placeName = 'woljeongri';
        placeImage = 'woljeongri.jpg';
        placeMsg = '월정리 해변 소개';
    } if (placeId === '3') {
        placeName = 'sehwa';
        placeImage = 'sehwa.jpg';
        placeMsg = '세화 해변 소개';
    }
    return (
        <div>
            <h1><p>{placeId}. {placeMsg}</p></h1><br />
            <img src={`/images/${placeImage}`} width={300} /><br />
            <button><a href='/place'>돌아가기</a></button>
        </div>
    );
}
