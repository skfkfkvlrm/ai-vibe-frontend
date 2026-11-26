"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "../japan/japan.module.css";
import { useI18n } from "../_i18n/I18n";
import { api, notifyChanged } from "./events";
import { useModal } from "./ModalProvider";

type Initial = { id?: number; name: string; sea: string; eat: string; picture: string };

// 생성/수정 공용 폼. 입력 검증은 서버가 최종 책임지며 여기서는 UX용 제한만 둔다.
export default function DestinationForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const { alert } = useModal();
  const { t, tError } = useI18n();
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
    try {
      const saved = editing
        ? await api(`/api/japan/${initial!.id}`, "PUT", body)
        : await api("/api/japan", "POST", body);
      notifyChanged();
      router.push(`/japan/${saved.id}`);
      await alert(t("action.saved"));
    } catch (err) {
      setBusy(false);
      await alert(tError(err));
    }
  }

  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <h2 className={styles.cardTitle}>{editing ? t("form.editTitle") : t("form.newTitle")}</h2>
      <label className={styles.field}>
        {t("form.name")}
        <input name="name" required maxLength={30} defaultValue={initial?.name} />
      </label>
      <label className={styles.field}>
        {t("form.sea")}
        <textarea name="sea" required maxLength={200} rows={3} defaultValue={initial?.sea} />
      </label>
      <label className={styles.field}>
        {t("form.eat")}
        <textarea name="eat" required maxLength={200} rows={3} defaultValue={initial?.eat} />
      </label>
      <label className={styles.field}>
        {t("form.picture")}
        <input
          name="picture"
          required
          maxLength={80}
          pattern="/images/[A-Za-z0-9_\-]{1,64}\.(jpg|jpeg|png|webp)"
          title={t("form.pictureHint")}
          placeholder="/images/tokyo.jpg"
          defaultValue={initial?.picture ?? "/images/"}
        />
      </label>
      <div className={styles.actions}>
        <button type="submit" className={styles.button} disabled={busy}>
          {busy ? t("action.saving") : t("action.save")}
        </button>
        <button type="button" className={styles.buttonGhost} onClick={() => router.back()}>
          {t("action.cancel")}
        </button>
      </div>
    </form>
  );
}
