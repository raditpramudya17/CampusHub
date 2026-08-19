import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CommentService } from '../services/commentService';
import { extractErrorMessage } from '../services/errorUtils';
import { formatDateID } from '../utils/format';

export default function CommentThread({ competitionId }) {
  const { isLoggedIn, user, isAdmin } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const result = await CommentService.getByCompetition(competitionId);
      setComments(result.data || []);
    } catch (err) {
      // non-blocking
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competitionId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    setError(null);
    try {
      await CommentService.create(competitionId, text.trim());
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
      await CommentService.remove(id);
      setComments((list) => list.filter((c) => c.id !== id));
    } catch (err) {
      // non-blocking
    }
  };

  return (
    <div className="border-t-[1.5px] border-dashed border-navy pt-5 mt-2">
      <div className="font-mono text-[10.5px] tracking-[.06em] uppercase text-muted mb-3">
        Diskusi {comments.length > 0 ? `(${comments.length})` : ''}
      </div>

      {loading ? (
        <div className="text-muted text-sm font-mono">Memuat diskusi…</div>
      ) : comments.length === 0 ? (
        <div className="text-muted text-sm mb-4">Belum ada pertanyaan. Jadilah yang pertama bertanya.</div>
      ) : (
        <div className="flex flex-col gap-3 mb-4 max-h-[220px] overflow-y-auto pr-1">
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
            placeholder="Tanya soal syarat, technical meeting, dsb…"
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
