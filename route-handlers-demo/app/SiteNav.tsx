"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

const items = [
    { href: "/", label: "홈" },
    { href: "/movie", label: "Movie" },
    { href: "/comments", label: "Comments" },
];

// 공통 상단 내비게이션. 모든 이동은 next/link 와 router 로 처리해 전체 새로고침이 일어나지 않는다.
export default function SiteNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { admin, ready, refresh } = useAuth();
    const [busy, setBusy] = useState(false);

    async function logout() {
        if (busy) return;
        setBusy(true);
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch {
            // 네트워크 오류여도 아래에서 서버 상태를 다시 확인한다
        } finally {
            await refresh();
            setBusy(false);
            router.push("/");
        }
    }

    const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

    return (
        <header className="border-b border-gray-400/40">
            <nav aria-label="주 메뉴" className="mx-auto flex max-w-[760px] items-center justify-between px-5 py-3">
                <ul className="flex gap-1">
                    {items.map((item) => (
                        <li key={item.href}>
                            <Link href={item.href} aria-current={isActive(item.href) ? "page" : undefined}
                                className={`rounded-lg px-3 py-1.5 text-sm hover:bg-gray-400/10 ${isActive(item.href) ? "bg-gray-400/15 font-semibold" : "opacity-70"}`}>
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
                {ready && (admin ? (
                    <button onClick={logout} disabled={busy}
                        className="rounded-lg border border-gray-400/60 px-3 py-1.5 text-sm hover:bg-gray-400/10 disabled:opacity-50">
                        {busy ? "로그아웃 중..." : "로그아웃"}
                    </button>
                ) : (
                    <Link href="/login" className="rounded-lg border border-gray-400/60 px-3 py-1.5 text-sm hover:bg-gray-400/10">
                        로그인
                    </Link>
                ))}
            </nav>
        </header>
    );
}
