"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "../japan/japan.module.css";
import { api, notifyChanged } from "./events";

type Initial = { id?: number; name: string; sea: string; eat: string; picture: string };

// 생성/수정 공용 폼. 입력 검증은 서버가 최종 책임지며 여기서는 UX용 제한만 둔다.
export default function DestinationForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const editing = initial?.id !== undefined;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = {
      name: String(f.get("name")),
      sea: String(f.get("sea")),
      eat: String(f.get("eat")),
      picture: String(f.get("picture")),
    };
    setBusy(true);
    setError("");
    try {
      const saved = editing
        ? await api(`/api/japan/${initial!.id}`, "PUT", body)
        : await api("/api/japan", "POST", body);
      notifyChanged();
      router.push(`/japan/${saved.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
      setBusy(false);
    }
  }

  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <h2 className={styles.cardTitle}>{editing ? "여행지 수정" : "새 여행지"}</h2>
      <label className={styles.field}>
        여행지명
        <input name="name" required maxLength={30} defaultValue={initial?.name} />
      </label>
      <label className={styles.field}>
        볼거리
        <textarea name="sea" required maxLength={200} rows={3} defaultValue={initial?.sea} />
      </label>
      <label className={styles.field}>
        먹거리
        <textarea name="eat" required maxLength={200} rows={3} defaultValue={initial?.eat} />
      </label>
      <label className={styles.field}>
        사진 경로
        <input
          name="picture"
          required
          maxLength={80}
          pattern="/images/[A-Za-z0-9_\-]{1,64}\.(jpg|jpeg|png|webp)"
          title="/images/파일명.jpg 형식 (jpg, jpeg, png, webp)"
          placeholder="/images/tokyo.jpg"
          defaultValue={initial?.picture ?? "/images/"}
        />
      </label>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.actions}>
        <button type="submit" className={styles.button} disabled={busy}>
          {busy ? "저장 중…" : "저장"}
        </button>
        <button type="button" className={styles.buttonGhost} onClick={() => router.back()}>
          취소
        </button>
      </div>
    </form>
  );
}
