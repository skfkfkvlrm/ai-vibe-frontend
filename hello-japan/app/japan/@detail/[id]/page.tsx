import { connection } from "next/server";
import { notFound } from "next/navigation";
import DestinationCard from "../../../_components/DestinationCard";
import { getById } from "../../../api/japan/store";
import { parseId } from "../../../api/japan/validate";

export default async function DetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection(); // 데이터가 수정될 수 있으므로 요청 시점에 렌더링
  const id = parseId((await params).id);
  const dest = id === null ? undefined : await getById(id);
  if (!dest) notFound();

  return <DestinationCard dest={dest} />;
}
