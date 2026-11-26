"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  DEFAULT_LOCALE,
  HTML_LANG,
  MESSAGES,
  isLocale,
  type Locale,
  type MessageKey,
} from "./messages";

const STORAGE_KEY = "hj_lang";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb); // 다른 탭의 변경 반영
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function getSnapshot(): Locale {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return isLocale(v) ? v : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

// SSR/하이드레이션 시에는 기본 언어를 사용하고, 마운트 후 저장된 언어로 전환된다.
function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

export function setLocale(locale: Locale) {
  if (!isLocale(locale)) return;
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* 저장 불가 환경이면 새로고침 전까지만 유지되지 않는다 */
  }
  listeners.forEach((cb) => cb());
}

export function useI18n() {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[locale];
  }, [locale]);

  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) => {
      let text: string = MESSAGES[locale][key] ?? MESSAGES[DEFAULT_LOCALE][key];
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.replaceAll(`{${k}}`, String(v));
        }
      }
      return text;
    },
    [locale],
  );

  /** API 오류(코드)를 현재 언어의 메시지로 변환한다. */
  const tError = useCallback(
    (e: unknown) => {
      const code = e instanceof Error ? e.message : "";
      const key = `err.${code}` as MessageKey;
      if (key in MESSAGES[DEFAULT_LOCALE]) return t(key);
      return t(e instanceof TypeError ? "err.network" : "err.generic");
    },
    [t],
  );

  return { locale, t, tError, setLocale };
}

/** 서버 컴포넌트에서도 번역 문구를 쓰기 위한 작은 컴포넌트 */
export function T({
  k,
  vars,
}: {
  k: MessageKey;
  vars?: Record<string, string | number>;
}) {
  const { t } = useI18n();
  return <>{t(k, vars)}</>;
}
