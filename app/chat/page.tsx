"use client";

import { useEffect, useState, useRef } from "react";
const STORAGE_KEY = "secure-chats-v1";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatSession = {
  id: string;
  title: string;
  summary: string;
  messages: Message[];
};

const enc = new TextEncoder();
const dec = new TextDecoder();

const hex = (b: Uint8Array) =>
  Array.from(b)
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");

const unhex = (h: string) =>
  new Uint8Array(h.match(/.{2}/g)!.map((x) => parseInt(x, 16)));
function createNewChat(): ChatSession {
  return {
    id: crypto.randomUUID(),
    title: "New chat",
    summary: "",
    messages: [],
  };
}

export default function Chat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [streaming, setStreaming] = useState(false);

  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(256);

  const outputRef = useRef<HTMLDivElement>(null);
  const [hydrated, setHydrated] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  useEffect(() => {
    let initialSessions: ChatSession[] = [];

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialSessions = parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to load chats, resetting", e);
    }

    // 🔑 GUARANTEE at least one chat
    if (initialSessions.length === 0) {
      initialSessions = [createNewChat()];
    }

    setSessions(initialSessions);
    setActiveId(initialSessions[0].id);
    setHydrated(true);
  }, []);

  // --------------------
  // Persistence
  // --------------------
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: ChatSession[] = JSON.parse(stored);
      setSessions(parsed);
      setActiveId(parsed[0]?.id ?? null);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions, hydrated]);

  const active = sessions.find((s) => s.id === activeId);
  function updateChat(id: string, updater: (chat: ChatSession) => ChatSession) {
    setSessions((prev) => prev.map((c) => (c.id === id ? updater(c) : c)));
  }

  // --------------------
  // New chat
  // --------------------
  function newChat() {
    setSessions((prev) => {
      const next = [createNewChat(), ...prev];
      setActiveId(next[0].id);
      return next;
    });
  }

  // --------------------
  // Send message (STREAMING)
  // --------------------
  async function send() {
    if (!activeId || !prompt.trim()) return;

    const userText = prompt;
    setPrompt("");
    setStreaming(true);

    // 1️⃣ Append user message + placeholder assistant
    updateChat(activeId, (chat) => ({
      ...chat,
      title: chat.title === "New chat" ? userText.slice(0, 32) : chat.title,
      messages: [
        ...chat.messages,
        { role: "user", content: userText },
        { role: "assistant", content: "" }, // placeholder
      ],
    }));

    // 2️⃣ Snapshot messages AFTER update
    const chat = sessions.find((c) => c.id === activeId)!;
    const recent = [
      ...chat.messages,
      { role: "user", content: userText },
    ].slice(-4);

    // ---- CRYPTO HANDSHAKE (unchanged logic, shortened here) ----
    const spkHex = await (await fetch(`${API_URL}/pubkey`)).text();
    const spk = unhex(spkHex);

    const clientKey = await crypto.subtle.generateKey(
      { name: "ECDH", namedCurve: "P-256" },
      true,
      ["deriveBits"]
    );

    const serverKey = await crypto.subtle.importKey(
      "raw",
      spk,
      { name: "ECDH", namedCurve: "P-256" },
      false,
      []
    );

    const shared = await crypto.subtle.deriveBits(
      { name: "ECDH", public: serverKey },
      clientKey.privateKey,
      256
    );

    const hkdfKey = await crypto.subtle.importKey(
      "raw",
      shared,
      "HKDF",
      false,
      ["deriveKey"]
    );

    const aesKey = await crypto.subtle.deriveKey(
      {
        name: "HKDF",
        hash: "SHA-256",
        salt: new Uint8Array([]),
        info: enc.encode("secure-chat"),
      },
      hkdfKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );

    const payload = {
      prompt: userText,
      context: {
        summary: chat.summary,
        recent,
      },
      params: {
        temperature,
        max_tokens: maxTokens,
      },
    };

    const nonce = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: nonce },
      aesKey,
      enc.encode(JSON.stringify(payload))
    );

    // 3️⃣ STREAM
    const resp = await fetch(`${API_URL}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_pub: hex(
          new Uint8Array(
            await crypto.subtle.exportKey("raw", clientKey.publicKey)
          )
        ),
        nonce: hex(nonce),
        ciphertext: hex(new Uint8Array(ct)),
      }),
    });

    const reader = resp.body!.getReader();
    let assistantText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const lines = dec.decode(value, { stream: true }).split("\n");

      for (const line of lines) {
        if (!line.trim()) continue;

        const chunk = JSON.parse(line);
        const pt = await crypto.subtle.decrypt(
          { name: "AES-GCM", iv: unhex(chunk.nonce) },
          aesKey,
          unhex(chunk.ciphertext)
        );

        assistantText += dec.decode(pt);

        // 🔁 Update ONLY the last assistant message
        updateChat(activeId, (chat) => {
          const msgs = [...chat.messages];
          msgs[msgs.length - 1] = {
            role: "assistant",
            content: assistantText,
          };
          return { ...chat, messages: msgs };
        });
      }
    }

    setStreaming(false);

    // ---- Trigger summarization every 6 turns ----
    const finalChat = sessions.find((c) => c.id === activeId);
    if (!finalChat) return;

    setStreaming(false);

    // ---- Trigger summarization every 6 messages ----
    if (finalChat && finalChat.messages.length % 6 === 0) {
      summarize(finalChat);
    }
  }

  // --------------------
  // Summarize
  // --------------------
  async function summarize(chat: ChatSession) {
    // Only summarize the last few turns
    const recent = chat.messages.slice(-6);

    // ---- CRYPTO HANDSHAKE (same as send) ----
    const spkHex = await (await fetch(`${API_URL}/pubkey`)).text();
    const spk = unhex(spkHex);

    const clientKey = await crypto.subtle.generateKey(
      { name: "ECDH", namedCurve: "P-256" },
      true,
      ["deriveBits"]
    );

    const serverKey = await crypto.subtle.importKey(
      "raw",
      spk,
      { name: "ECDH", namedCurve: "P-256" },
      false,
      []
    );

    const shared = await crypto.subtle.deriveBits(
      { name: "ECDH", public: serverKey },
      clientKey.privateKey,
      256
    );

    const hkdfKey = await crypto.subtle.importKey(
      "raw",
      shared,
      "HKDF",
      false,
      ["deriveKey"]
    );

    const aesKey = await crypto.subtle.deriveKey(
      {
        name: "HKDF",
        hash: "SHA-256",
        salt: new Uint8Array([]),
        info: enc.encode("secure-chat"),
      },
      hkdfKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );

    const payload = {
      summary: chat.summary,
      recent,
    };

    const nonce = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: nonce },
      aesKey,
      enc.encode(JSON.stringify(payload))
    );

    const resp = await fetch(`${API_URL}/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_pub: hex(
          new Uint8Array(
            await crypto.subtle.exportKey("raw", clientKey.publicKey)
          )
        ),
        nonce: hex(nonce),
        ciphertext: hex(new Uint8Array(ct)),
      }),
    });

    const data = await resp.json();

    const pt = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: unhex(data.nonce) },
      aesKey,
      unhex(data.ciphertext)
    );

    const newSummary = dec.decode(pt);

    // ---- Update chat summary + prune history ----
    updateChat(chat.id, (c) => ({
      ...c,
      summary: newSummary,
      messages: c.messages.slice(-6), // keep only recent turns
    }));
  }

  // --------------------
  // UI
  // --------------------
  return (
    <div className="flex h-screen bg-[#050505] text-white">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/10 bg-[#070707] p-4 flex flex-col">
        <button
          onClick={newChat}
          className="mb-4 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-black hover:opacity-90 transition"
        >
          + New Chat
        </button>

        <div className="flex-1 space-y-1 overflow-y-auto">
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className={`cursor-pointer rounded-lg px-3 py-2 text-sm transition ${
                s.id === activeId
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {s.title || "Untitled chat"}
            </div>
          ))}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          🔐 End-to-end encrypted
        </div>
      </aside>

      {/* Chat */}
      <main className="flex flex-1 flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
          {active?.messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-black"
                    : "bg-white/10 text-gray-200"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          <div ref={outputRef} />
        </div>

        {/* Controls */}
        <div className="border-t border-white/10 bg-[#070707] p-4">
          {/* Settings */}
          <div className="mb-3 flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span>Temperature</span>
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="accent-cyan-400"
              />
              <span className="w-8 text-right">{temperature}</span>
            </div>

            <div className="flex items-center gap-2">
              <span>Max tokens</span>
              <select
                value={maxTokens}
                onChange={(e) => setMaxTokens(Number(e.target.value))}
                className="rounded bg-white/10 px-2 py-1 text-white"
              >
                {[64, 128, 256, 512].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type a confidential message…"
              className="flex-1 resize-none rounded-xl bg-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              rows={2}
            />
            <button
              disabled={streaming}
              onClick={send}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {streaming ? "Streaming…" : "Send"}
            </button>
          </div>

          <p className="mt-2 text-[11px] text-gray-500">
            Messages are encrypted before processing. No logs. No retention.
          </p>
        </div>
      </main>
    </div>
  );
}
