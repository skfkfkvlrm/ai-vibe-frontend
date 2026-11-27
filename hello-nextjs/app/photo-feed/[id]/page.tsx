import Image from "next/image";
import wondersImages from "../jeju";
import { notFound } from "next/navigation";
export default async function PhotoDetail(
    { params, }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const photo = wondersImages.find((p) => p.id === id);
    if (!photo) notFound();
    return (
        <main className="grid grid-cols-1 md:grid-cols-3 gap-1">
            <Image alt={photo.name} src={photo.src}
                className="w-full object-cover aspect-square" />
            <button><a href='/photo-feed'>돌아가기</a></button>
        </main>
    )
}