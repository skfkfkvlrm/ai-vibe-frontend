"use client";

import { useI18n } from "../_i18n/I18n";
import { LOCALES, LOCALE_LABEL, isLocale } from "../_i18n/messages";
import styles from "../japan/japan.module.css";

export default function SiteHeader() {
  const { locale, t, setLocale } = useI18n();

  return (
    <header className={styles.header}>
      <span className={styles.sun} aria-hidden="true" />
      <div className={styles.headerText}>
        <h1 className={styles.title}>hello-japan</h1>
        <p className={styles.subtitle}>{t("site.subtitle")}</p>
      </div>
      <label className={styles.langPicker}>
        <span className={styles.srOnly}>{t("lang.label")}</span>
        <select
          value={locale}
          onChange={(e) => isLocale(e.target.value) && setLocale(e.target.value)}
        >
          {LOCALES.map((l) => (
            <option key={l} value={l}>
              {LOCALE_LABEL[l]}
            </option>
          ))}
        </select>
      </label>
    </header>
  );
}
