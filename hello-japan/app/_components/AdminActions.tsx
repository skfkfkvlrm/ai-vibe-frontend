"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "../japan/japan.module.css";
import { useI18n } from "../_i18n/I18n";
import { api, notifyChanged } from "./events";
import { useModal } from "./ModalProvider";

// 관리자일 때만 수정/삭제 버튼을 보여준다. (실제 권한 검사는 서버 API가 수행)
export default function AdminActions({ id }: { id: number }) {
  const router = useRouter();
  const { alert, confirm } = useModal();
  const { t, tError } = useI18n();
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setAdmin(Boolean(d.admin)))
      .catch(() => setAdmin(false));
  }, []);

  if (!admin) return null;

  async function onDelete() {
    if (!(await confirm(t("action.deleteConfirm")))) return;
    try {
      await api(`/api/japan/${id}`, "DELETE");
    } catch (e) {
      await alert(tError(e));
      return;
    }
    notifyChanged();
    router.push("/japan");
    await alert(t("action.deleted"));
  }

  return (
    <div className={styles.actions}>
      <Link href={`/japan/${id}/edit`} className={styles.button}>
        {t("action.edit")}
      </Link>
      <button type="button" className={styles.buttonDanger} onClick={onDelete}>
        {t("action.delete")}
      </button>
    </div>
  );
}
