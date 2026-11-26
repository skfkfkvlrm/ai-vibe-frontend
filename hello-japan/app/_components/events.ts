// 목록/관리자 상태를 다시 불러오도록 알리는 클라이언트 이벤트
export const CHANGED_EVENT = "japan:changed";

export function notifyChanged() {
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

/** 변경 요청 공통 헬퍼. 실패 시 서버 메시지를 담은 Error를 던진다. */
export async function api(
  url: string,
  method: "POST" | "PUT" | "DELETE",
  body?: unknown,
) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "generic"); // 서버가 내려주는 오류 코드(번역은 tError)
  return data;
}
