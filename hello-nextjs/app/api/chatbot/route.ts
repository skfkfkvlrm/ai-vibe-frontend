// Llama2 엔드포인트 중계 (브라우저 CORS 회피, 내부 IP 비노출)
const ENDPOINT = "http://192.168.2.18:9292/api/v1/generate";
const TIMEOUT_MS = 120_000;
const ANSWER_KEYS = ["text", "response", "answer", "result", "message", "content", "output"];

// 응답 형식을 모르므로 방어적으로 처리: JSON이면 흔한 필드를 찾고, 아니면 본문 그대로
function extractAnswer(raw: string): string {
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data === "string") return data;
    if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>;
      for (const key of ANSWER_KEYS) {
        if (typeof obj[key] === "string") return obj[key] as string;
      }
    }
    return raw;
  } catch {
    return raw;
  }
}

export async function POST(request: Request) {
  let body: { promptMessage?: unknown; customerId?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const promptMessage = typeof body.promptMessage === "string" ? body.promptMessage.trim() : "";
  const customerId = typeof body.customerId === "string" ? body.customerId.trim() : "";
  if (!promptMessage || !customerId) {
    return Response.json({ error: "질문과 customerId를 입력하세요." }, { status: 400 });
  }

  const url = `${ENDPOINT}?promptMessage=${encodeURIComponent(promptMessage)}&customerId=${encodeURIComponent(customerId)}`;

  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) });
    const raw = await res.text();
    if (!res.ok) {
      return Response.json({ error: `챗봇 서버 오류 (HTTP ${res.status})` }, { status: 502 });
    }
    return Response.json({ answer: extractAnswer(raw) });
  } catch (e) {
    const timedOut = e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError");
    return Response.json(
      { error: timedOut ? "챗봇 서버 응답 시간이 초과되었습니다." : "챗봇 서버에 연결할 수 없습니다." },
      { status: 504 },
    );
  }
}
