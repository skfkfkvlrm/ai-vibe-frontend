import { products } from "@/app/_lib/product";
import { notFound } from "next/navigation";

export default async function Detail(
    { params }: { params: Promise<{ productId: string }> }
) {
    const productId = (await params).productId;
    const product = products.find(
        (item) => item.id === Number(productId)
    ); if (!product) {
        notFound();
    }
    return (
        <div>
            <h1>제품 소개입니다</h1>
            <h2>{productId}. {product.name}</h2><br />
            <p>가격: {product.price}</p>
            <p>{product.description}</p>
            <img src={product.image} width={300}></img><br />
        </div >
    );
}