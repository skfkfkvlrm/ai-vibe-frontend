"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

type AuthState = {
    admin: boolean;
    ready: boolean;
    refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({ admin: false, ready: false, refresh: async () => {} });

async function fetchAdmin(): Promise<boolean> {
    try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) return false;
        const data: { admin?: unknown } = await response.json();
        return data.admin === true;
    } catch {
        return false;
    }
}

// 관리자 로그인 상태를 앱 시작 때 한 번만 확인해 모든 페이지가 공유한다.
// 로그인·로그아웃 직후에는 refresh() 로 즉시 다시 확인한다.
export function AuthProvider({ children }: { children: ReactNode }) {
    const [admin, setAdmin] = useState(false);
    const [ready, setReady] = useState(false);
    const latest = useRef(0); // 요청 번호: 가장 마지막에 시작한 확인 결과만 반영한다(응답 순서 역전 방지)
    const alive = useRef(true);

    const refresh = useCallback(async () => {
        const mine = ++latest.current;
        const value = await fetchAdmin();
        if (!alive.current || mine !== latest.current) return;
        setAdmin(value);
        setReady(true);
    }, []);

    useEffect(() => {
        alive.current = true;
        const mine = ++latest.current;
        fetchAdmin().then((value) => {
            if (!alive.current || mine !== latest.current) return;
            setAdmin(value);
            setReady(true);
        });
        return () => {
            alive.current = false;
        };
    }, []);

    const value = useMemo(() => ({ admin, ready, refresh }), [admin, ready, refresh]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
    return useContext(AuthContext);
}
