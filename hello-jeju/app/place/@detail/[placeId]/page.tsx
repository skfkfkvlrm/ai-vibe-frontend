import { travels } from '../../../_lib/jeju';
import { notFound } from "next/navigation";

export default async function PlaceDetail(
    { params, }: {
        params: Promise<{ placeId: string }>
    }
) {
    const placeId = (await params).placeId;
    const travel = travels.find(
        (item) => item.id === Number(placeId)
    );
    if (!travel) {
        notFound();
    }
    return (
        <div>
            <h1><p>{placeId}. {travel.name}</p></h1><br />
            <p>{travel.description}</p>
            <img src={`/images/${travel.image}`} width={300} /><br />
            <button><a href='/place'>돌아가기</a></button>
        </div>
    );
}
