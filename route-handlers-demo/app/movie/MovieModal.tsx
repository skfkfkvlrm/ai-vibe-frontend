"use client";

import { useEffect, useRef, useState } from "react";
import type { JSX } from "react";
import Link from "next/link";

export type MovieItem = {
    id: number; poster: string; title: string; director: string; actor: string;
    count: string; releaseDate: string; country: string; company: string;
};

type Props = {
    mode: "create" | "edit";
    movie?: MovieItem;
    posterOptions: string[];
    onClose: () => void;
    onSaved: (saved: MovieItem) => void;
};

type FormValues = Omit<MovieItem, "id">;

const emptyValues: FormValues = {
    title: "", director: "", actor: "", count: "", releaseDate: "", country: "", company: "", poster: ""
};

function posterLabel(path: string): string {
    const match = path.match(/\d+/);
    return match ? `포스터 ${match[0]}` : path;
}

export default function MovieModal(props: Props): JSX.Element {
    const initialValues: FormValues = props.mode === "edit" && props.movie
        ? { title: props.movie.title, director: props.movie.director, actor: props.movie.actor, count: props.movie.count, releaseDate: props.movie.releaseDate, country: props.movie.country, company: props.movie.company, poster: props.movie.poster }
        : emptyValues;
    const [values, setValues] = useState<FormValues>(initialValues);
    const [error, setError] = useState<string>("");
    const [saving, setSaving] = useState(false);
    const titleRef = useRef<HTMLInputElement>(null);

    // 최신 onClose·saving 을 ref 로 들고 있어 마운트 때 한 번만 포커스·키 리스너를 등록한다(입력 중 포커스 이동 방지)
    const onCloseRef = useRef(props.onClose);
    const savingRef = useRef(saving);
    useEffect(() => {
        onCloseRef.current = props.onClose;
        savingRef.current = saving;
    });

    useEffect(() => {
        titleRef.current?.focus();
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !savingRef.current) onCloseRef.current();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    const update = (field: keyof FormValues, value: string) => {
        setValues((current) => ({ ...current, [field]: field === "count" ? formatCount(value) : value }));
    };

    const validate = (form: FormValues): string => {
        if (form.title.length < 1 || form.title.length > 100) return "제목은 1~100자로 입력해 주세요.";
        if (form.director.length < 1 || form.director.length > 100) return "감독은 1~100자로 입력해 주세요.";
        if (form.actor.length > 200) return "주연은 200자 이하로 입력해 주세요.";
        if (form.country.length > 200) return "제작 국가는 200자 이하로 입력해 주세요.";
        if (form.company.length > 200) return "제작사는 200자 이하로 입력해 주세요.";
        return "";
    };

    const submit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (saving) return;
        const form = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()])) as FormValues;
        const validationError = validate(form);
        if (validationError) { setError(validationError); return; }
        setSaving(true);
        try {
            const response = await fetch(props.mode === "create" ? "/api/movie" : "/api/movie/" + props.movie?.id, {
                method: props.mode === "create" ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            let responseBody: unknown;
            try { responseBody = await response.json(); } catch { responseBody = undefined; }
            if (response.ok) { onSavedResponse(responseBody, props.onSaved); props.onClose(); return; }
            setError(errorForStatus(response.status, responseBody));
        } catch {
            setError("저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        } finally { setSaving(false); }
    };

    const extraPoster = props.mode === "edit" && values.poster && !props.posterOptions.includes(values.poster) ? [values.poster] : [];
    const titleId = "movie-modal-title";
    const inputClass = "w-full rounded-lg border border-gray-400/60 bg-transparent px-3 py-2 outline-none focus:border-blue-500";
    const fields: Array<[keyof FormValues, string, string?]> = [["title", "제목", "required"], ["director", "감독", "required"], ["actor", "주연"], ["count", "관객 수"], ["releaseDate", "개봉일"], ["country", "제작 국가"], ["company", "제작사"]];

    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(event) => { if (event.target === event.currentTarget && !saving) props.onClose(); }}>
        <form role="dialog" aria-modal="true" aria-labelledby={titleId} onSubmit={submit} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-gray-400/40 bg-[var(--background)] p-6 shadow-xl">
            <h2 id={titleId} className="mb-5 text-xl font-semibold">{props.mode === "create" ? "영화 추가" : "영화 수정"}</h2>
            {error && <div role="alert" className="mb-4 text-red-600 text-sm">{error}{error === "로그인이 필요합니다." && <span className="ml-2"><Link href="/login" className="underline">로그인 화면으로 이동</Link></span>}</div>}
            <div className="space-y-4">{fields.map(([field, label, required], index) => <label key={field} className="block"><span className="mb-1 block">{label}</span><input ref={index === 0 ? titleRef : undefined} type={field === "releaseDate" ? "date" : "text"} required={Boolean(required)} value={values[field]} onChange={(event) => update(field, event.target.value)} className={inputClass} /></label>)}
                <label className="block"><span className="mb-1 block">포스터</span><select value={values.poster} onChange={(event) => update("poster", event.target.value)} className={inputClass}><option value="">없음</option>{[...props.posterOptions, ...extraPoster].map((path) => <option key={path} value={path}>{posterLabel(path)}</option>)}</select></label>
            </div>
            <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={props.onClose} disabled={saving} className="rounded-lg border border-gray-400/60 px-4 py-2">취소</button><button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">{saving ? "저장 중..." : "저장"}</button></div>
        </form>
    </div>;
}

// 숫자를 문자열로 유지한 채 세 자리마다 쉼표를 넣는다(Number 변환 시 긴 숫자의 정밀도 손실 방지). 최대 15자리.
function formatCount(value: string): string {
    const digits = value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 15);
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function onSavedResponse(value: unknown, onSaved: (saved: MovieItem) => void): void { onSaved(value as MovieItem); }

function errorForStatus(status: number, body: unknown): string {
    const serverError = typeof body === "object" && body !== null && "error" in body && typeof body.error === "string" ? body.error : "";
    if (status === 400) return serverError === "invalid title" ? "제목을 확인해 주세요." : serverError === "invalid director" ? "감독을 확인해 주세요." : serverError === "invalid count" ? "관객 수 형식이 올바르지 않습니다." : serverError === "invalid releaseDate" ? "개봉일이 올바르지 않습니다." : serverError === "invalid poster" ? "포스터를 다시 선택해 주세요." : "입력값을 확인해 주세요.";
    if (status === 401) return "로그인이 필요합니다.";
    if (status === 403) return "허용되지 않은 요청입니다.";
    if (status === 413) return "입력 내용이 너무 깁니다.";
    if (status === 415) return "요청 형식이 올바르지 않습니다.";
    if (status === 429) return "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
    return "저장에 실패했습니다. 잠시 후 다시 시도해 주세요.";
}
