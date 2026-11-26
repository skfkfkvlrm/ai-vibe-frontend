import { connection } from "next/server";
import { notFound } from "next/navigation";
import DestinationForm from "../../../../_components/DestinationForm";
import { getById } from "../../../../api/japan/store";
import { parseId } from "../../../../api/japan/validate";

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const id = parseId((await params).id);
  const dest = id === null ? undefined : await getById(id);
  if (!dest) notFound();

  return <DestinationForm initial={dest} />;
}
