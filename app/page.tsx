"use client";

import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Request failed");
      }

      setMessages([...nextMessages, { role: "assistant", content: data.text }]);
    } catch (err) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: `Error: ${err instanceof Error ? err.message : "Something went wrong"}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    // Page wrapper — centers the chat column horizontally
    <div className="flex flex-1 flex-col items-center">
      {/* Chat container — capped width, fills available height, padded */}
      <div className="flex w-full max-w-2xl flex-1 flex-col p-4">
        {/* Message history — scrolls independently as messages pile up */}
        <div className="flex-1 space-y-3 overflow-y-auto py-4">
          {messages.map((m, i) => (
            // One row per message; user messages align right, assistant left
            <div
              key={i}
              className={m.role === "user" ? "text-right" : "text-left"}
            >
              {/* Message bubble — color/alignment differ by sender */}
              <span
                className={
                  "inline-block max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 " +
                  (m.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-black")
                }
              >
                {m.content}
              </span>
            </div>
          ))}
          {/* Transient "typing" indicator shown while awaiting the API response */}
          {loading && <div className="text-left text-sm text-gray-500">Thinking…</div>}
        </div>

        {/* Composer — text input + send button, submits via sendMessage */}
        <form onSubmit={sendMessage} className="flex gap-2 pt-2">
          {/* Message input, controlled by the `input` state */}
          <input
            className="flex-1 rounded border border-gray-300 px-3 py-2 focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            disabled={loading}
          />
          {/* Send button — disabled while loading or when input is empty */}
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            disabled={loading || !input.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
