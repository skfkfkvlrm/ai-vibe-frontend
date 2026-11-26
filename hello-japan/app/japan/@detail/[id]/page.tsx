import Image from "next/image";
import { notFound } from "next/navigation";
import { destinations, getDestination } from "../../../api/japan/data";

export function generateStaticParams() {
  return destinations.map((d) => ({ id: String(d.id) }));
}

export default async function DetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dest = getDestination(Number(id));
  if (!dest) notFound();

  return (
    <article className="flex flex-col gap-4">
      <h2 className="text-3xl font-bold">{dest.name}</h2>
      <Image
        src={dest.picture}
        alt={`${dest.name} 풍경`}
        width={1280}
        height={853}
        priority
        className="h-80 w-full rounded-xl object-cover"
      />
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
        <dt className="font-semibold">볼거리</dt>
        <dd>{dest.sea}</dd>
        <dt className="font-semibold">먹거리</dt>
        <dd>{dest.eat}</dd>
      </dl>
    </article>
  );
}
