"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Destination, Translation } from "../api/japan/data";
import { useI18n } from "../_i18n/I18n";
import { LOCALES, LOCALE_LABEL, type Locale } from "../_i18n/messages";
import styles from "../japan/japan.module.css";
import { api, notifyChanged } from "./events";
import { useModal } from "./ModalProvider";

type Fields = { name: string; sea: string; eat: string };
const KEYS = ["name", "sea", "eat"] as const;
const TR_LOCALES = ["en", "ja", "zh"] as const;
const MAX = { name: 30, sea: 200, eat: 200 };

const fromTr = (tr?: Translation): Fields => ({
  name: tr?.name ?? "",
  sea: tr?.sea ?? "",
  eat: tr?.eat ?? "",
});

// 생성/수정 공용 폼. 입력 검증은 서버가 최종 책임지며 여기서는 UX용 제한만 둔다.
export default function DestinationForm({ initial }: { initial?: Destination }) {
  const router = useRouter();
  const { alert, confirm } = useModal();
  const { t, tError } = useI18n();
  const [busy, setBusy] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [tab, setTab] = useState<Locale>("ko");
  const [values, setValues] = useState<Record<Locale, Fields>>(() => ({
    ko: {
      name: initial?.name ?? "",
      sea: initial?.sea ?? "",
      eat: initial?.eat ?? "",
    },
    en: fromTr(initial?.i18n?.en),
    ja: fromTr(initial?.i18n?.ja),
    zh: fromTr(initial?.i18n?.zh),
  }));
  const editing = initial?.id !== undefined;

  function setField(locale: Locale, key: keyof Fields, value: string) {
    setValues((v) => ({ ...v, [locale]: { ...v[locale], [key]: value } }));
  }

  const koComplete = KEYS.every((k) => values.ko[k].trim() !== "");

  async function onTranslate() {
    if (!koComplete) {
      setTab("ko");
      await alert(t("form.needKorean"));
      return;
    }
    const hasExisting = TR_LOCALES.some((l) =>
      KEYS.some((k) => values[l][k].trim() !== ""),
    );
    if (hasExisting && !(await confirm(t("form.translateOverwrite")))) return;

    setTranslating(true);
    try {
      const ko = values.ko;
      const r = await api("/api/japan/translate", "POST", {
        name: ko.name.trim(),
        sea: ko.sea.trim(),
        eat: ko.eat.trim(),
      });
      setValues((v) => ({ ...v, en: fromTr(r.en), ja: fromTr(r.ja), zh: fromTr(r.zh) }));
      setTab("en");
      await alert(t("form.translateDone")); // 저장 전에 검토하도록 안내
    } catch (err) {
      await alert(tError(err));
    } finally {
      setTranslating(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!koComplete) {
      setTab("ko");
      await alert(t("form.needKorean"));
      return;
    }
    const picture = String(new FormData(e.currentTarget).get("picture"));
    const i18n: Partial<Record<(typeof TR_LOCALES)[number], Translation>> = {};
    for (const l of TR_LOCALES) {
      const tr: Translation = {};
      for (const k of KEYS) {
        const v = values[l][k].trim();
        if (v) tr[k] = v;
      }
      if (Object.keys(tr).length > 0) i18n[l] = tr;
    }
    const body = {
      name: values.ko.name.trim(),
      sea: values.ko.sea.trim(),
      eat: values.ko.eat.trim(),
      picture,
      i18n,
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

  const labels = { name: t("form.name"), sea: t("form.sea"), eat: t("form.eat") };

  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <h2 className={styles.cardTitle}>{editing ? t("form.editTitle") : t("form.newTitle")}</h2>

      <div className={styles.tabs} role="tablist">
        {LOCALES.map((l) => (
          <button
            key={l}
            type="button"
            role="tab"
            aria-selected={tab === l}
            className={`${styles.tab} ${tab === l ? styles.tabActive : ""}`}
            onClick={() => setTab(l)}
          >
            {LOCALE_LABEL[l]}
          </button>
        ))}
        <span className={styles.tabsSpacer} />
        <button
          type="button"
          className={styles.buttonGhost}
          onClick={onTranslate}
          disabled={translating || busy}
        >
          {translating ? t("form.translating") : t("form.translateBtn")}
        </button>
      </div>
      <p className={styles.hint}>{t("form.translateHelp")}</p>

      {KEYS.map((k) => (
        <label key={`${tab}-${k}`} className={styles.field}>
          {labels[k]}
          {k === "name" ? (
            <input
              lang={tab}
              maxLength={MAX.name}
              value={values[tab][k]}
              onChange={(e) => setField(tab, k, e.target.value)}
            />
          ) : (
            <textarea
              lang={tab}
              rows={3}
              maxLength={MAX[k]}
              value={values[tab][k]}
              onChange={(e) => setField(tab, k, e.target.value)}
            />
          )}
        </label>
      ))}

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
        <button type="submit" className={styles.button} disabled={busy || translating}>
          {busy ? t("action.saving") : t("action.save")}
        </button>
        <button type="button" className={styles.buttonGhost} onClick={() => router.back()}>
          {t("action.cancel")}
        </button>
      </div>
    </form>
  );
}
