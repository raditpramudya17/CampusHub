import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { ChatService } from '../../services/chatService';
import { extractErrorMessage } from '../../services/errorUtils';
import ChatMessage from './ChatMessage';

const bubbleClass = (from) =>
  from === 'bot'
    ? 'self-start max-w-[85%] bg-card border-[1.5px] border-navy rounded-[3px] px-3 py-2.5 text-[13px] leading-relaxed'
    : 'self-end max-w-[85%] bg-navy text-cream rounded-[3px] px-3 py-2.5 text-[13px] leading-relaxed';

// Fallback if the model list can't be fetched (server unreachable, etc).
// Kept as a full tag ("gemma4:latest"), not a bare name — Ollama matches
// model names exactly and does not resolve bare names to a default tag.
const FALLBACK_MODEL = 'gemma4:latest';

const ChatWidget = forwardRef(function ChatWidget(_props, ref) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [model, setModel] = useState(FALLBACK_MODEL);
  const [msgs, setMsgs] = useState([
    { from: 'bot', text: 'Halo! Aku MadingBot 🤖 Tanya apa saja soal lomba: "lomba IT terdekat?", "yang gratis apa?", dsb.' },
  ]);
  const listRef = useRef(null);

  useImperativeHandle(ref, () => ({
    toggle: () => setOpen((o) => !o),
  }));

  useEffect(() => {
    // Pick a real model from the server instead of hardcoding a name/tag that
    // might not exist — prefer gemma4 if present, else just take the first one.
    ChatService.getModels()
      .then((models) => {
        if (!models.length) return;
        const gemma4 = models.find((m) => m.name?.startsWith('gemma4'));
        setModel((gemma4 || models[0]).name);
      })
      .catch(() => {
        // keep FALLBACK_MODEL — server might be temporarily unreachable
      });
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setMsgs((m) => [...m, { from: 'user', text }]);
    setInput('');
    setSending(true);
    try {
      const reply = await ChatService.send(model, text);
      setMsgs((m) => [...m, { from: 'bot', text: reply }]);
    } catch (err) {
      setMsgs((m) => [...m, { from: 'bot', text: `Maaf, terjadi error: ${extractErrorMessage(err)}` }]);
    } finally {
      setSending(false);
      requestAnimationFrame(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
      });
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-[22px] right-[22px] z-[110] w-14 h-14 rounded-full border-2 border-navy bg-amber cursor-pointer text-[22px] shadow-[3px_4px_0_#1E2A45] flex items-center justify-center hover:-translate-y-0.5 transition-transform"
        aria-label="Buka chat MadingBot"
      >
        💬
      </button>

      {open && (
        <div className="fixed bottom-[90px] right-[22px] z-[110] w-[340px] max-w-[calc(100vw-44px)] bg-cream border-2 border-navy rounded-[6px] shadow-[6px_8px_0_rgba(30,42,69,.25)] flex flex-col overflow-hidden">
          <div className="bg-navy text-cream px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green" />
              <span className="font-mono text-xs tracking-[.06em] uppercase">MadingBot</span>
            </div>
            <button onClick={() => setOpen(false)} className="border-none bg-transparent text-cream cursor-pointer text-sm">✕</button>
          </div>
          <div ref={listRef} className="p-3.5 flex flex-col gap-2.5 max-h-[300px] overflow-y-auto">
            {msgs.map((m, i) => (
              <div key={i} className={bubbleClass(m.from)}>
                {m.from === 'bot' ? <ChatMessage text={m.text} /> : m.text}
              </div>
            ))}
            {sending && <div className={bubbleClass('bot')}>…</div>}
          </div>
          <div className="flex gap-1.5 p-2.5 border-t-[1.5px] border-navy">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="tanya soal lomba…"
              className="flex-1 border-[1.5px] border-navy rounded-[3px] bg-white px-2.5 py-2 text-[13px] text-navy font-sans"
            />
            <button
              onClick={send}
              disabled={sending}
              className="font-mono text-xs px-3.5 border-none rounded-[3px] bg-navy text-cream cursor-pointer hover:bg-green disabled:opacity-50"
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
});

export default ChatWidget;
