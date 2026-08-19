import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TeamPostService } from '../services/teamPostService';
import { extractErrorMessage } from '../services/errorUtils';
import { formatDateID } from '../utils/format';

export default function TeamPostCommentThread({ teamPostId, onCountChange }) {
  const { isLoggedIn, user, isAdmin } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const result = await TeamPostService.getComments(teamPostId);
      setComments(result.data || []);
      onCountChange?.(result.data?.length ?? 0);
    } catch (err) {
      // non-blocking
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamPostId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    setError(null);
    try {
      await TeamPostService.addComment(teamPostId, text.trim());
      setText('');
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const remove = async (id) => {
    try {
      await TeamPostService.removeComment(id);
      setComments((list) => {
        const next = list.filter((c) => c.id !== id);
        onCountChange?.(next.length);
        return next;
      });
    } catch (err) {
      // non-blocking
    }
  };

  return (
    <div className="border-t-[1.5px] border-dashed border-navy pt-3.5 mt-3.5">
      {loading ? (
        <div className="text-muted text-sm font-mono">Memuat diskusi…</div>
      ) : comments.length === 0 ? (
        <div className="text-muted text-sm mb-3">Belum ada pertanyaan. Jadilah yang pertama bertanya.</div>
      ) : (
        <div className="flex flex-col gap-2.5 mb-3.5 max-h-[220px] overflow-y-auto pr-1">
          {comments.map((c) => (
            <div key={c.id} className="bg-white/60 border border-line rounded-[3px] px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10.5px] text-muted">{c.author} · {formatDateID(c.createdAt)}</span>
                {(isAdmin || (user && user.username === c.author)) && (
                  <button onClick={() => remove(c.id)} className="font-mono text-[10px] text-red underline bg-transparent border-none cursor-pointer">Hapus</button>
                )}
              </div>
              <div className="text-[13.5px] text-navy mt-1">{c.text}</div>
            </div>
          ))}
        </div>
      )}

      {isLoggedIn ? (
        <form onSubmit={submit} className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tanya soal peran, timeline, dsb…"
            className="flex-1 border-[1.5px] border-navy rounded-[3px] bg-white px-3 py-2 font-sans text-[13px] text-navy"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="font-mono text-[12px] px-4 border-none rounded-[3px] bg-navy text-cream cursor-pointer hover:bg-green disabled:opacity-50"
          >
            Kirim
          </button>
        </form>
      ) : (
        <div className="text-sm text-muted">
          <a href="#/auth" className="text-navy underline font-semibold">Masuk</a> untuk ikut berdiskusi.
        </div>
      )}
      {error && <div className="text-red text-xs mt-1.5">{error}</div>}
    </div>
  );
}
