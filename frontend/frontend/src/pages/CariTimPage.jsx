import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TeamPostService } from '../services/teamPostService';
import { extractErrorMessage } from '../services/errorUtils';
import { formatDateID } from '../utils/format';
import VoteWidget from '../components/VoteWidget';
import TeamPostCommentThread from '../components/TeamPostCommentThread';

const inputClass = 'w-full border-[1.5px] border-navy rounded-[3px] bg-white px-3 py-2.5 font-sans text-sm text-navy';
const labelClass = 'font-mono text-[10.5px] tracking-[.06em] uppercase text-muted mb-1.5 block';

const EMPTY_FORM = { title: '', description: '', rolesNeeded: '', contactInfo: '' };

function contactLink(contact) {
  const trimmed = contact.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return { href: `mailto:${trimmed}`, label: trimmed };
  const digits = trimmed.replace(/[^\d]/g, '');
  if (digits.length >= 9 && digits.length <= 15 && /^[\d+\-\s]+$/.test(trimmed)) {
    const wa = digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
    return { href: `https://wa.me/${wa}`, label: trimmed };
  }
  return { href: null, label: trimmed };
}

function CreatePostForm({ onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const canSubmit = form.title.trim() && form.description.trim() && form.rolesNeeded.trim() && form.contactInfo.trim();

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      await TeamPostService.create({
        title: form.title.trim(),
        description: form.description.trim(),
        rolesNeeded: form.rolesNeeded.trim(),
        contactInfo: form.contactInfo.trim(),
      });
      setForm(EMPTY_FORM);
      onCreated();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-card border-[1.5px] border-navy rounded-[4px] p-6 flex flex-col gap-3.5 mb-8">
      {error && <div className="text-red text-sm">{error}</div>}
      <div>
        <span className={labelClass}>Judul *</span>
        <input className={inputClass} placeholder="mis. Cari 2 anggota tim untuk Hackathon elevAIte" value={form.title} onChange={update('title')} />
      </div>
      <div>
        <span className={labelClass}>Deskripsi *</span>
        <textarea rows={3} className={inputClass + ' resize-y'} placeholder="Jelaskan lomba, timeline, dan apa yang kamu cari…" value={form.description} onChange={update('description')} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <span className={labelClass}>Peran dibutuhkan *</span>
          <input className={inputClass} placeholder="mis. 1 desainer UI, 1 backend" value={form.rolesNeeded} onChange={update('rolesNeeded')} />
        </div>
        <div>
          <span className={labelClass}>Kontak *</span>
          <input className={inputClass} placeholder="No. WA atau email" value={form.contactInfo} onChange={update('contactInfo')} />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading || !canSubmit}
        className="self-start font-mono text-[12.5px] tracking-[.04em] uppercase px-5 py-2.5 border-none rounded-[3px] bg-navy text-cream cursor-pointer hover:bg-green transition-colors disabled:opacity-50"
      >
        {loading ? 'Mengirim…' : 'Pasang Pengumuman'}
      </button>
    </form>
  );
}

function TeamPostCard({ post, canDelete, onVoteChange, onDelete, open, onToggleDiscussion, onCommentCountChange }) {
  const contact = contactLink(post.contactInfo);

  return (
    <div className="bg-card border-[1.5px] border-navy rounded-[4px] px-5 py-5 flex gap-4 transition-all duration-150 hover:shadow-[4px_5px_0_#1E2A45]">
      <VoteWidget teamPostId={post.id} score={post.score} myVote={post.myVote} onChange={(v) => onVoteChange(post.id, v)} />

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="font-mono text-[10px] tracking-[.08em] uppercase text-muted mb-1.5">
              {post.competitionTitle ? `terkait "${post.competitionTitle}" · ` : ''}oleh {post.author} · {formatDateID(post.createdAt)}
            </div>
            <div className="font-serif font-semibold text-lg text-navy leading-snug">{post.title}</div>
          </div>
          {canDelete && (
            <button onClick={() => onDelete(post.id)} className="font-mono text-[10px] uppercase text-red underline cursor-pointer bg-transparent border-none shrink-0">
              Hapus
            </button>
          )}
        </div>
        <p className="text-[14px] text-muted my-2.5">{post.description}</p>
        <div className="font-mono text-[12px] text-navy mb-3"><strong>Dibutuhkan:</strong> {post.rolesNeeded}</div>

        <div className="flex items-center gap-2.5 flex-wrap mt-auto">
          {contact.href ? (
            <a href={contact.href} target="_blank" rel="noopener noreferrer" className="inline-block font-mono text-[12px] px-3 py-1.5 border-[1.5px] border-green text-green rounded-[3px] underline">
              Hubungi: {contact.label}
            </a>
          ) : (
            <span className="inline-block font-mono text-[12px] px-3 py-1.5 border-[1.5px] border-line text-navy rounded-[3px]">
              Kontak: {contact.label}
            </span>
          )}
          <button
            onClick={onToggleDiscussion}
            className="font-mono text-[12px] px-3 py-1.5 border-[1.5px] border-navy rounded-[3px] bg-transparent text-navy hover:bg-navy hover:text-cream transition-colors cursor-pointer"
          >
            💬 {post.commentCount > 0 ? `${post.commentCount} Diskusi` : 'Diskusi'}
          </button>
        </div>

        {open && (
          <TeamPostCommentThread teamPostId={post.id} onCountChange={(count) => onCommentCountChange(post.id, count)} />
        )}
      </div>
    </div>
  );
}

export default function CariTimPage() {
  const { isLoggedIn, user, isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [openDiscussionId, setOpenDiscussionId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await TeamPostService.getAll();
      setItems(result.data || []);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    try {
      await TeamPostService.remove(id);
      setItems((list) => list.filter((p) => p.id !== id));
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleVoteChange = (id, { score, myVote }) => {
    setItems((list) => list.map((p) => (p.id === id ? { ...p, score, myVote } : p)));
  };

  const handleCommentCountChange = (id, count) => {
    setItems((list) => list.map((p) => (p.id === id ? { ...p, commentCount: count } : p)));
  };

  const sorted = [...items].sort((a, b) => b.score - a.score || new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <section className="max-w-[900px] mx-auto w-full px-6 py-12 flex-1">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3.5">
        <div className="font-mono text-xs tracking-[.12em] uppercase text-amber">Cari Rekan Tim</div>
        {isLoggedIn && (
          <button
            onClick={() => setShowForm((s) => !s)}
            className="font-mono text-[11px] tracking-[.04em] uppercase px-4 py-2 border-[1.5px] border-navy rounded-[3px] bg-amber text-navy font-semibold cursor-pointer hover:bg-navy hover:text-cream transition-colors"
          >
            {showForm ? 'Tutup Form' : '+ Pasang Pengumuman'}
          </button>
        )}
      </div>
      <h1 className="m-0 mb-2 font-serif font-semibold text-[34px] text-navy">Cari Tim</h1>
      <p className="m-0 mb-6 text-muted">Butuh anggota tim untuk ikut lomba? Pasang pengumuman di sini, siapa tahu ada yang cocok. Naikkan (▲) pengumuman yang paling relevan supaya makin terlihat.</p>

      {!isLoggedIn && (
        <div className="mb-6 border-[1.5px] border-dashed border-line rounded-[4px] px-4 py-3 text-sm text-muted">
          <a href="#/auth" className="text-navy underline font-semibold">Masuk</a> untuk memasang pengumuman, vote, dan ikut diskusi.
        </div>
      )}

      {showForm && <CreatePostForm onCreated={() => { setShowForm(false); load(); }} />}

      {error && <div className="text-red font-mono text-sm mb-5">{error}</div>}
      {loading && <div className="text-center py-16 font-mono text-sm text-muted">Memuat pengumuman…</div>}

      {!loading && !error && sorted.length === 0 && (
        <div className="text-center py-16 px-5 border-[1.5px] border-dashed border-line rounded-[4px]">
          <div className="font-serif text-xl mb-2 text-navy">Belum ada pengumuman.</div>
          <p className="m-0 text-muted text-sm">Jadilah yang pertama mencari rekan tim!</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {sorted.map((p) => {
          const canDelete = isAdmin || (user && user.username === p.author);
          return (
            <TeamPostCard
              key={p.id}
              post={p}
              canDelete={canDelete}
              onVoteChange={handleVoteChange}
              onDelete={remove}
              open={openDiscussionId === p.id}
              onToggleDiscussion={() => setOpenDiscussionId((id) => (id === p.id ? null : p.id))}
              onCommentCountChange={handleCommentCountChange}
            />
          );
        })}
      </div>
    </section>
  );
}
