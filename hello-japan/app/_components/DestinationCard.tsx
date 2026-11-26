"use client";

import Image from "next/image";
import type { Destination } from "../api/japan/data";
import { useI18n } from "../_i18n/I18n";
import { localize } from "../_i18n/localize";
import styles from "../japan/japan.module.css";
import AdminActions from "./AdminActions";

// 상세 표시(번역이 필요한 라벨 포함). 데이터 조회는 서버 페이지가 담당한다.
export default function DestinationCard({ dest }: { dest: Destination }) {
  const { t, locale } = useI18n();
  const view = localize(dest, locale);
  return (
    <article className={styles.card}>
      <h2 className={styles.cardTitle}>{view.name}</h2>
      <Image
        src={dest.picture}
        alt={t("detail.photoAlt", { name: view.name })}
        width={1280}
        height={853}
        priority
        className={styles.photo}
      />
      <dl className={styles.info}>
        <dt>{t("detail.sea")}</dt>
        <dd>{view.sea}</dd>
        <dt>{t("detail.eat")}</dt>
        <dd>{view.eat}</dd>
      </dl>
      <AdminActions id={dest.id} />
    </article>
  );
}
