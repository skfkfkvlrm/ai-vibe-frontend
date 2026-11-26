"use client";

import { useEffect, useState } from "react";

// 관리자 로그인 여부. 서버 렌더링 결과에는 관리 버튼이 없고, 마운트 후 확인되면 나타난다.
export function useAdmin(): boolean {
    const [admin, setAdmin] = useState(false);

    useEffect(() => {
        let alive = true;
        fetch("/api/auth/me")
            .then((response) => (response.ok ? response.json() : { admin: false }))
            .then((data: { admin?: unknown }) => {
                if (alive) setAdmin(data.admin === true);
            })
            .catch(() => {
                if (alive) setAdmin(false);
            });
        return () => {
            alive = false;
        };
    }, []);

    return admin;
}
