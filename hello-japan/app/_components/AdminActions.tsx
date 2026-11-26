"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "../japan/japan.module.css";
import { api, notifyChanged } from "./events";

// 관리자일 때만 수정/삭제 버튼을 보여준다. (실제 권한 검사는 서버 API가 수행)
export default function AdminActions({ id }: { id: number }) {
  const router = useRouter();
  const [admin, setAdmin] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setAdmin(Boolean(d.admin)))
      .catch(() => setAdmin(false));
  }, []);

  if (!admin) return null;

  async function onDelete() {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await api(`/api/japan/${id}`, "DELETE");
      notifyChanged();
      router.push("/japan");
    } catch (e) {
      setError(e instanceof Error ? e.message : "삭제에 실패했습니다.");
    }
  }

  return (
    <div className={styles.actions}>
      <Link href={`/japan/${id}/edit`} className={styles.button}>
        수정
      </Link>
      <button type="button" className={styles.buttonDanger} onClick={onDelete}>
        삭제
      </button>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
