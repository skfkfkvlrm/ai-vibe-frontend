import Image from "next/image";
import wondersImages from "../../jeju";
import Modal from "@/components/modal";
import { notFound } from "next/navigation";
export default async function PhotoModalPage(
    { params, }: { params: Promise<{ id: string }>; }
) {
    const { id } = await params;
    const photo = wondersImages.find((item) => item.id === id);
    if (!photo) notFound();
    return (
        <Modal>
            <Image alt={photo.name} src={photo.src}
                className="w-full object-cover aspect-square" />
        </Modal>
    )
}