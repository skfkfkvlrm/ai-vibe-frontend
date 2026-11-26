import { requireAdmin } from "../../../../lib/security/auth";

// 로그인 상태 확인용: 항상 200과 { admin: boolean } 만 반환한다(세션 내용은 노출하지 않음).
// requireAdmin 은 예외를 던지지 않는다. try/catch 로 감싸면 Next 의 동적 렌더링 판별 예외까지 삼키므로 감싸지 않는다.
export async function GET(request: Request) {
    return Response.json({ admin: requireAdmin(request) === null });
}
