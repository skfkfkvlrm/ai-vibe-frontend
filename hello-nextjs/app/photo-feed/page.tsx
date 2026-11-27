import Image from "next/image";
import wondersImages, { JejuImage } from "./jeju";
import Link from "next/link";

export default function PhotoFeedPage() {
    return (
        <main className="container mx-auto">
            <h1 className="text-center text-3x1 font-bold my-4">제주도 사진</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {wondersImages.map(({ id, name, src }, index) =>
                    <Link key={id} href={`photo-feed/${id}`}>
                        <Image alt={name} src={src} priority={index < 4}
                            className="w-full object-cover aspect-square" />
                    </Link>
                )}
            </div>
            <button><a href='/'>돌아가기</a></button>
        </main>
    );
}