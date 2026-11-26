import type { Destination } from "../api/japan/data";
import type { Locale } from "./messages";

/** 현재 언어의 표시 텍스트. 번역이 없는 필드는 한국어 원문으로 대체한다. */
export function localize(d: Destination, locale: Locale) {
  const tr = locale === "ko" ? undefined : d.i18n?.[locale];
  return {
    name: tr?.name || d.name,
    sea: tr?.sea || d.sea,
    eat: tr?.eat || d.eat,
  };
}
