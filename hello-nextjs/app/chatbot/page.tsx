"use client";
import { useEffect, useRef, useState } from "react";

type Message = { role: "user" | "bot" | "error"; text: string };

export default function ChatbotPage() {
    const [customerId, setCustomerId] = useState<string>("sora");
    const [input, setInput] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    async function send() {
        const promptMessage = input.trim();
        if (!promptMessage || !customerId.trim() || loading) return;

        setMessages((prev) => [...prev, { role: "user", text: promptMessage }]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/chatbot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ promptMessage, customerId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "요청에 실패했습니다.");
            setMessages((prev) => [...prev, { role: "bot", text: data.answer }]);
        } catch (e) {
            const text = e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.";
            setMessages((prev) => [...prev, { role: "error", text }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-6">
            <h1 className="text-2xl font-bold">AI 챗봇</h1>

            <label className="flex items-center gap-2 text-sm">
                customerId:
                <input
                    className="rounded border px-2 py-1"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                />
            </label>

            <div className="flex h-[28rem] flex-col gap-3 overflow-y-auto rounded border bg-gray-50 p-4">
                {messages.length === 0 && (
                    <p className="m-auto text-gray-400">질문을 입력해 대화를 시작하세요.</p>
                )}
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 ${
                            m.role === "user"
                                ? "self-end bg-blue-600 text-white"
                                : m.role === "bot"
                                  ? "self-start bg-white text-black shadow"
                                  : "self-start bg-red-100 text-red-700"
                        }`}
                    >
                        {m.text}
                    </div>
                ))}
                {loading && <div className="self-start text-gray-500">답변을 생성하는 중...</div>}
                <div ref={bottomRef} />
            </div>

            <form
                className="flex gap-2"
                onSubmit={(e) => {
                    e.preventDefault();
                    send();
                }}
            >
                <input
                    className="flex-1 rounded border px-3 py-2"
                    placeholder="질문을 입력하세요 (예: 이탈리아의 수도는?)"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim() || !customerId.trim()}
                    className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                >
                    전송
                </button>
            </form>
        </div>
    );
}
