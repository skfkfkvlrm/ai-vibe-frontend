"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Destination } from "../api/japan/data";
import styles from "../japan/japan.module.css";

// 목록은 라우트 핸들러(GET /api/japan)에서 가져온다.
export default function DestinationList() {
  const [items, setItems] = useState<Destination[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/japan")
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<Destination[]>;
      })
      .then((data) => alive && setItems(data))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <nav aria-label="여행지 목록">
      <h2 className={styles.listTitle}>여행지 목록</h2>
      {failed ? (
        <p className={styles.error}>목록을 불러오지 못했습니다.</p>
      ) : !items ? (
        <p className={styles.message}>불러오는 중…</p>
      ) : (
        <ul className={styles.list}>
          {items.map((d) => (
            <li key={d.id}>
              <Link href={`/japan/${d.id}`} className={styles.link}>
                {d.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
