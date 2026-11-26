"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, notifyChanged } from "../../../_components/events";
import { useI18n } from "../../../_i18n/I18n";
import { useModal } from "../../../_components/ModalProvider";
import styles from "../../japan.module.css";

export default function LoginPage() {
  const router = useRouter();
  const { alert } = useModal();
  const { t, tError } = useI18n();
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
      await alert(tError(err));
    }
  }

  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <h2 className={styles.cardTitle}>{t("login.title")}</h2>
      <label className={styles.field}>
        {t("login.password")}
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
          {busy ? t("action.checking") : t("action.login")}
        </button>
      </div>
    </form>
  );
}
