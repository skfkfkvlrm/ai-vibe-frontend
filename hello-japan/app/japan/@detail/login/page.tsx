"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, notifyChanged } from "../../../_components/events";
import { useModal } from "../../../_components/ModalProvider";
import styles from "../../japan.module.css";

export default function LoginPage() {
  const router = useRouter();
  const { alert } = useModal();
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password"));
    setBusy(true);
    try {
      await api("/api/auth/login", "POST", { password });
      notifyChanged();
      router.push("/japan");
    } catch (err) {
      setBusy(false);
      await alert(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    }
  }

  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <h2 className={styles.cardTitle}>관리자 로그인</h2>
      <label className={styles.field}>
        비밀번호
        <input
          name="password"
          type="password"
          required
          maxLength={200}
          autoComplete="current-password"
        />
      </label>
      <div className={styles.actions}>
        <button type="submit" className={styles.button} disabled={busy}>
          {busy ? "확인 중…" : "로그인"}
        </button>
      </div>
    </form>
  );
}
