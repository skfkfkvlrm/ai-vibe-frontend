import { products } from "@/app/_lib/product";
import { notFound } from "next/navigation";

export default async function Detail(
    { params }: { params: Promise<{ productId: string }> }
) {
    const productId = (await params).productId;
    const travel = products.find(
        (item) => item.id === Number(productId)
    ); if (!travel) {
        notFound();
    }
    return (
        <div>
            <h1>{productId}. {travel.name}</h1><br />
            <p>가격: {travel.price}</p>
            <p>{travel.description}</p>
            <img src={`/image/${travel.image}`} width={300}></img><br />
        </div >
    );
}