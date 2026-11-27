import Image from "next/image";
import wondersImages, { JejuImage } from "./jeju";

export default function PhotoFeedPage() {
    return (
        <div>
            <h1>제주도 사진</h1>
            <div>
                {wondersImages.map(({ id, name, src }) =>
                    <Image alt={name} src={src}></Image>)}
            </div>
            <button><a href='/'>돌아가기</a></button>
        </div>
    );
}