import Image from "next/image";
import { notFound } from "next/navigation";
import { destinations, getDestination } from "../../../api/japan/data";
import styles from "../../japan.module.css";

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
    <article className={styles.card}>
      <h2 className={styles.cardTitle}>{dest.name}</h2>
      <Image
        src={dest.picture}
        alt={`${dest.name} 풍경`}
        width={1280}
        height={853}
        priority
        className={styles.photo}
      />
      <dl className={styles.info}>
        <dt>볼거리</dt>
        <dd>{dest.sea}</dd>
        <dt>먹거리</dt>
        <dd>{dest.eat}</dd>
      </dl>
    </article>
  );
}
