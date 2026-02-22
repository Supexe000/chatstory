"use client";

import { useState, useRef, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Message {
  id: number;
  date: string;       // e.g. "12/02/2026"
  time: string;       // e.g. "10:45 pm"
  sender: string;     // e.g. "Zain"
  content: string;    // message body (may be multi-line)
}

// ── WhatsApp parser ────────────────────────────────────────────────────────────

/**
 * Regex matching the start of a WhatsApp message line.
 * Supports both:
 *   12/02/2026, 10:45 pm - Sender: message
 *   12/02/2026, 22:45 - Sender: message
 */
const LINE_RE = /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(\d{1,2}:\d{2}(?:\s*[ap]m)?)\s*-\s*([^:]+):\s*(.*)/i;

function parseWhatsApp(raw: string): Message[] {
  const lines = raw.split(/\r?\n/);
  const messages: Message[] = [];

  for (const line of lines) {
    const match = LINE_RE.exec(line);
    if (match) {
      messages.push({
        id: messages.length,
        date: match[1].trim(),
        time: match[2].trim(),
        sender: match[3].trim(),
        content: match[4].trim(),
      });
    } else if (messages.length > 0 && line.trim()) {
      // Continuation of previous message (multi-line)
      messages[messages.length - 1].content += "\n" + line.trim();
    }
    // If line is empty – skip
  }

  return messages;
}

// ── Upload zone ────────────────────────────────────────────────────────────────

function UploadZone({ onFile }: { onFile: (text: string) => void }) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = useCallback(
    (file: File) => {
      setError("");
      if (!file.name.endsWith(".txt")) {
        setError("Please upload a .txt file exported from WhatsApp.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => onFile(e.target?.result as string);
      reader.readAsText(file, "utf-8");
    },
    [onFile]
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 px-4">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          {/* WhatsApp-ish icon */}
          <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg">
            <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white">
              <path d="M16 2C8.268 2 2 8.268 2 16c0 2.54.672 4.92 1.845 6.978L2 30l7.285-1.812A13.93 13.93 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.4a11.35 11.35 0 01-5.77-1.574l-.413-.245-4.328 1.077 1.1-4.208-.27-.433A11.364 11.364 0 014.6 16C4.6 9.7 9.7 4.6 16 4.6S27.4 9.7 27.4 16 22.3 27.4 16 27.4zm6.26-8.487c-.343-.172-2.03-1.003-2.345-1.117-.315-.115-.544-.172-.774.172-.229.343-.888 1.117-1.088 1.346-.2.229-.4.258-.744.086-.343-.172-1.448-.534-2.758-1.703-1.019-.91-1.707-2.034-1.907-2.377-.2-.343-.021-.528.15-.699.154-.153.343-.4.515-.6.172-.2.229-.343.343-.572.115-.229.058-.43-.029-.601-.086-.172-.773-1.864-1.06-2.553-.28-.67-.564-.578-.774-.59l-.659-.011c-.229 0-.601.086-.916.43-.315.343-1.202 1.175-1.202 2.864 0 1.69 1.23 3.322 1.402 3.55.172.229 2.42 3.694 5.865 5.182.82.354 1.46.565 1.96.723.823.262 1.573.225 2.165.137.66-.099 2.03-.83 2.317-1.633.287-.803.287-1.49.2-1.633-.087-.143-.315-.229-.659-.4z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">ChatStory</h1>
        </div>
        <p className="text-gray-400 text-sm">Upload your WhatsApp chat export and relive your conversations.</p>
        <p className="text-xs text-gray-600 mt-1">🔒 Processed 100% in your browser — never uploaded anywhere.</p>
      </div>

      {/* Drop zone */}
      <div
        className={`w-full max-w-md border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-all
          ${dragging ? "border-green-400 bg-green-950/30" : "border-gray-700 bg-gray-900 hover:border-gray-500"}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handle(file);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center">
          <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-white font-medium">Drop your chat file here</p>
          <p className="text-gray-500 text-sm mt-1">or click to browse — .txt files only</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".txt"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handle(file);
          }}
        />
      </div>

      {error && (
        <p className="mt-4 text-red-400 text-sm">{error}</p>
      )}

      {/* How to export guide */}
      <div className="mt-8 w-full max-w-md bg-gray-900 rounded-xl p-4 border border-gray-800">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">How to export from WhatsApp</p>
        <ol className="text-gray-500 text-sm space-y-1 list-decimal list-inside">
          <li>Open the chat in WhatsApp</li>
          <li>Tap ⋮ → More → Export chat</li>
          <li>Choose <strong className="text-gray-400">Without media</strong></li>
          <li>Save the .txt file and upload it here</li>
        </ol>
      </div>
    </div>
  );
}

// ── Date separator ─────────────────────────────────────────────────────────────

function DateSeparator({ date }: { date: string }) {
  return (
    <div className="flex items-center justify-center my-4">
      <span className="bg-gray-700/60 text-gray-300 text-xs px-3 py-1 rounded-full">
        {date}
      </span>
    </div>
  );
}

// ── Single message bubble ──────────────────────────────────────────────────────

function Bubble({
  msg,
  isSelf,
}: {
  msg: Message;
  isSelf: boolean;
}) {
  return (
    <div className={`flex w-full ${isSelf ? "justify-end" : "justify-start"} mb-1`}>
      <div
        className={`max-w-[75%] sm:max-w-[60%] rounded-2xl px-4 py-2 shadow-sm
          ${isSelf
            ? "bg-green-600 text-white rounded-br-sm"
            : "bg-gray-700 text-gray-100 rounded-bl-sm"
          }`}
      >
        {/* Sender name (only on left/receiver side) */}
        {!isSelf && (
          <p className="text-xs font-semibold text-green-400 mb-0.5">{msg.sender}</p>
        )}

        {/* Message content */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {msg.content}
        </p>

        {/* Timestamp */}
        <p className={`text-[10px] mt-1 text-right ${isSelf ? "text-green-200" : "text-gray-400"}`}>
          {msg.time}
        </p>
      </div>
    </div>
  );
}

// ── Chat view ──────────────────────────────────────────────────────────────────

function ChatView({
  messages,
  onBack,
}: {
  messages: Message[];
  onBack: () => void;
}) {
  // Determine the two participants
  const senders = [...new Set(messages.map((m) => m.sender))];
  const selfSender = senders[0]; // First person encountered = "right" side

  // Group consecutive messages by date for separators
  let lastDate = "";

  // Stats
  const totalMessages = messages.length;
  const senderCounts: Record<string, number> = {};
  for (const m of messages) {
    senderCounts[m.sender] = (senderCounts[m.sender] ?? 0) + 1;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 bg-gray-900 border-b border-gray-800 px-4 py-3 z-10 shadow-md">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
          aria-label="Back"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {senders.map((s) => s[0]).join("").slice(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">
            {senders.join(" & ")}
          </p>
          <p className="text-gray-500 text-xs">{totalMessages} messages</p>
        </div>

        {/* Stats pills */}
        {Object.entries(senderCounts).map(([name, count]) => (
          <div key={name} className="hidden sm:flex flex-col items-center bg-gray-800 rounded-lg px-2 py-1">
            <span className="text-white text-xs font-semibold">{count}</span>
            <span className="text-gray-500 text-[10px] truncate max-w-[60px]">{name}</span>
          </div>
        ))}
      </div>

      {/* ── Messages ── */}
      <div
        className="flex-1 overflow-y-auto chat-scroll px-3 sm:px-6 py-4"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 50%, rgba(34,197,94,0.03) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.03) 0%, transparent 60%)
          `,
        }}
      >
        {messages.map((msg) => {
          const showDate = msg.date !== lastDate;
          lastDate = msg.date;
          const isSelf = msg.sender === selfSender;

          return (
            <div key={msg.id}>
              {showDate && <DateSeparator date={msg.date} />}
              <Bubble msg={msg} isSelf={isSelf} />
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div className="bg-gray-900 border-t border-gray-800 px-4 py-2 flex items-center justify-center">
        <p className="text-gray-600 text-xs">
          🔒 Your chat is processed locally — never stored or sent anywhere.
        </p>
      </div>
    </div>
  );
}

// ── Root page ──────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [error, setError] = useState("");

  const handleFileText = (text: string) => {
    const parsed = parseWhatsApp(text);
    if (parsed.length === 0) {
      setError("No messages found. Make sure the file is a WhatsApp .txt export.");
      return;
    }
    setMessages(parsed);
  };

  if (messages) {
    return (
      <ChatView
        messages={messages}
        onBack={() => setMessages(null)}
      />
    );
  }

  return <UploadZone onFile={handleFileText} />;
}
