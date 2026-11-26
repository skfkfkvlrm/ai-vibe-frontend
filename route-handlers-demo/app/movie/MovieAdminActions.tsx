"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MovieModal, { type MovieItem } from "./MovieModal";
import { useAdmin } from "./useAdmin";
import { useAuth } from "../AuthProvider";

// 상세 페이지의 관리자 전용 버튼(수정·삭제). 방문자에게는 아무것도 렌더링하지 않는다.
export default function MovieAdminActions({ movie, posterOptions }: { movie: MovieItem; posterOptions: string[] }) {
    const admin = useAdmin();
    const { refresh } = useAuth();
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const cancelRef = useRef<HTMLButtonElement>(null);
    const busyRef = useRef(busy);

    useEffect(() => {
        busyRef.current = busy;
    });

    // 삭제 확인창: 열리면 취소 버튼에 포커스, ESC 로 닫기(삭제 중에는 닫지 않음)
    useEffect(() => {
        if (!confirming) return;
        cancelRef.current?.focus();
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !busyRef.current) setConfirming(false);
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [confirming]);

    if (!admin) return null;

    async function remove() {
        if (busy) return;
        setBusy(true);
        setMessage("");
        try {
            const response = await fetch(`/api/movie/${movie.id}`, { method: "DELETE" });
            if (response.ok) {
                router.push("/movie");
                return;
            }
            setConfirming(false);
            if (response.status === 401) {
                setMessage("로그인이 필요합니다. 다시 로그인해 주세요.");
                await refresh(); // 세션이 만료됐으면 관리자 UI 를 숨긴다
            }
            else if (response.status === 404) setMessage("이미 삭제된 영화입니다.");
            else if (response.status === 429) setMessage("요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.");
            else setMessage("삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        } catch {
            setConfirming(false);
            setMessage("삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="mt-8 border-t border-gray-400/40 pt-6">
            <div className="flex gap-2">
                <button onClick={() => setEditing(true)}
                    className="rounded-lg border border-gray-400/60 px-4 py-2 hover:bg-gray-400/10">
                    수정
                </button>
                <button onClick={() => setConfirming(true)}
                    className="rounded-lg border border-red-500/60 px-4 py-2 text-red-600 hover:bg-red-500/10">
                    삭제
                </button>
            </div>
            {message && <p role="alert" className="mt-3 text-sm text-red-600">{message}</p>}

            {editing && (
                <MovieModal mode="edit" movie={movie} posterOptions={posterOptions}
                    onClose={() => setEditing(false)}
                    onSaved={() => router.refresh()} />
            )}

            {confirming && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => { if (!busy) setConfirming(false); }}>
                    <div role="alertdialog" aria-modal="true" aria-labelledby="delete-title"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-sm rounded-xl border border-gray-400/40 bg-[var(--background)] p-6 shadow-xl">
                        <h2 id="delete-title" className="mb-2 text-lg font-semibold">영화를 삭제할까요?</h2>
                        <p className="mb-5 text-sm opacity-70">「{movie.title}」을(를) 삭제합니다. 이 작업은 되돌릴 수 없습니다.</p>
                        <div className="flex justify-end gap-2">
                            <button ref={cancelRef} onClick={() => setConfirming(false)} disabled={busy}
                                className="rounded-lg border border-gray-400/60 px-4 py-2 hover:bg-gray-400/10 disabled:opacity-50">
                                취소
                            </button>
                            <button onClick={remove} disabled={busy}
                                className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50">
                                {busy ? "삭제 중..." : "삭제"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
