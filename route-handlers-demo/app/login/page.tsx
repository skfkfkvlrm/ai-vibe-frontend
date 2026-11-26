"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthProvider";

export default function LoginPage() {
    const router = useRouter();
    const { refresh } = useAuth();
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, password }),
        });

        if (response.ok) {
            await refresh();
            router.push("/movie");
        } else if (response.status === 401) {
            setError("아이디 또는 비밀번호가 올바르지 않습니다");
        } else if (response.status === 429) {
            setError("잠시 후 다시 시도해 주세요");
        } else {
            setError("로그인에 실패했습니다");
        }
    }

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        await refresh();
    }

    return (
        <main className="mx-auto max-w-md px-5 py-12">
            <div className="rounded-lg border border-gray-400/40 p-6 shadow-sm">
                <h1 className="mb-6 text-2xl font-bold">관리자 로그인</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        value={id}
                        onChange={(event) => setId(event.target.value)}
                        autoComplete="username"
                        placeholder="아이디"
                        className="w-full rounded-lg border border-gray-400/60 bg-transparent px-3 py-2 outline-none focus:border-blue-500"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="current-password"
                        placeholder="비밀번호"
                        className="w-full rounded-lg border border-gray-400/60 bg-transparent px-3 py-2 outline-none focus:border-blue-500"
                    />
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <button type="submit" className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
                        로그인
                    </button>
                </form>
                <button onClick={handleLogout} className="mt-4 w-full rounded-lg border border-gray-400/60 px-4 py-2 hover:bg-gray-400/10">
                    로그아웃
                </button>
            </div>
        </main>
    );
}
