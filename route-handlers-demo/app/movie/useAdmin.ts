"use client";

import { useAuth } from "../AuthProvider";

// 관리자 로그인 여부. 루트 레이아웃의 AuthProvider 가 한 번 확인한 값을 공유한다.
// 서버 렌더링 결과에는 관리 버튼이 없고, 확인이 끝나면 나타난다.
export function useAdmin(): boolean {
    return useAuth().admin;
}
