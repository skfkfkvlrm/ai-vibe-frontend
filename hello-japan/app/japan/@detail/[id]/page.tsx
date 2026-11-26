import Image from "next/image";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import AdminActions from "../../../_components/AdminActions";
import { getById } from "../../../api/japan/store";
import { parseId } from "../../../api/japan/validate";
import styles from "../../japan.module.css";

export default async function DetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection(); // 데이터가 수정될 수 있으므로 요청 시점에 렌더링
  const id = parseId((await params).id);
  const dest = id === null ? undefined : await getById(id);
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
      <AdminActions id={dest.id} />
    </article>
  );
}
