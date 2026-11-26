"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Destination } from "../api/japan/data";
import styles from "../japan/japan.module.css";
import { useI18n } from "../_i18n/I18n";
import { localize } from "../_i18n/localize";
import { CHANGED_EVENT, api, notifyChanged } from "./events";

// 목록은 라우트 핸들러(GET /api/japan)에서 가져온다.
export default function DestinationList() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const [items, setItems] = useState<Destination[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [admin, setAdmin] = useState(false);

  const reload = useCallback(async () => {
    try {
      const [list, me] = await Promise.all([
        fetch("/api/japan", { cache: "no-store" }),
        fetch("/api/auth/me", { cache: "no-store" }),
      ]);
      if (!list.ok) throw new Error();
      setItems((await list.json()) as Destination[]);
      setAdmin(Boolean((await me.json()).admin));
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
    window.addEventListener(CHANGED_EVENT, reload);
    return () => window.removeEventListener(CHANGED_EVENT, reload);
  }, [reload]);

  async function logout() {
    try {
      await api("/api/auth/logout", "POST");
    } finally {
      notifyChanged();
      router.push("/japan");
    }
  }

  return (
    <nav aria-label={t("list.title")}>
      <h2 className={styles.listTitle}>{t("list.title")}</h2>
      {failed ? (
        <p className={styles.error}>{t("list.failed")}</p>
      ) : !items ? (
        <p className={styles.message}>{t("list.loading")}</p>
      ) : (
        <ul className={styles.list}>
          {items.map((d) => (
            <li key={d.id}>
              <Link href={`/japan/${d.id}`} className={styles.link}>
                {localize(d, locale).name}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className={styles.sideActions}>
        {admin ? (
          <>
            <Link href="/japan/new" className={styles.button}>
              {t("list.add")}
            </Link>
            <button type="button" className={styles.buttonGhost} onClick={logout}>
              {t("list.logout")}
            </button>
          </>
        ) : (
          <Link href="/japan/login" className={styles.buttonGhost}>
            {t("list.login")}
          </Link>
        )}
      </div>
    </nav>
  );
}
