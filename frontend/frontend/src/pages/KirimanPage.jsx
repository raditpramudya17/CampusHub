import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CompetitionService } from '../services/competitionService';
import { extractErrorMessage } from '../services/errorUtils';
import { categoryLabel, formatDateID } from '../utils/format';

const STATUS_META = {
  pending: { label: '● Menunggu', color: '#E8A93C', bg: 'rgba(232,169,60,.15)' },
  approved: { label: '✓ Disetujui', color: '#5F7D6B', bg: 'rgba(95,125,107,.12)' },
  rejected: { label: '✕ Ditolak', color: '#C0453A', bg: 'rgba(192,69,58,.1)' },
};

export default function KirimanPage() {
  const { user, isLoggedIn } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoggedIn || !user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const mine = await CompetitionService.getMine(user.username);
        if (!cancelled) setItems(mine);
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isLoggedIn, user]);

  if (!isLoggedIn) {
    return (
      <section className="max-w-[560px] mx-auto w-full px-6 py-16 flex-1 text-center">
        <h1 className="font-serif font-semibold text-3xl text-navy mb-3">Masuk dulu, yuk.</h1>
        <p className="text-muted mb-6">Masuk untuk melihat status moderasi lomba yang kamu unggah.</p>
        <a href="#/auth" className="inline-block font-mono text-xs tracking-[.04em] uppercase px-6 py-3.5 border-none rounded-[3px] bg-navy text-cream hover:bg-green transition-colors">
          Masuk / Daftar
        </a>
      </section>
    );
  }

  return (
    <section className="max-w-[860px] mx-auto w-full px-6 py-12 flex-1">
      <h1 className="m-0 mb-2 font-serif font-semibold text-[34px] text-navy">Kiriman Saya</h1>
      <p className="m-0 mb-7 text-muted">Status moderasi lomba yang kamu unggah.</p>

      {error && <div className="text-red font-mono text-sm mb-5">{error}</div>}
      {loading && <div className="text-center py-16 font-mono text-sm text-muted">Memuat kiriman…</div>}

      {!loading && !error && items.length === 0 && (
        <div className="text-center py-16 px-5 border-[1.5px] border-dashed border-line rounded-[4px]">
          <div className="font-serif text-xl mb-2 text-navy">Belum ada kiriman.</div>
          <p className="m-0 text-muted text-sm">
            Lomba yang kamu unggah lewat <a href="#/unggah" className="underline text-navy">+ Unggah</a> akan muncul di sini.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {items.map((k) => {
          const meta = STATUS_META[k.status] || STATUS_META.pending;
          return (
            <div
              key={k.id}
              className="bg-card border-[1.5px] border-navy rounded-[4px] border-l-[5px] px-5.5 py-5 transition-all duration-150 hover:-translate-y-[2px] hover:shadow-[4px_5px_0_#1E2A45]"
              style={{ borderLeftColor: meta.color }}
            >
              <div className="flex items-start justify-between gap-3.5 flex-wrap">
                <div className="min-w-0">
                  <div className="font-mono text-[10px] tracking-[.08em] uppercase text-muted mb-1.5">
                    {categoryLabel(k.category)} · dikirim {formatDateID(k.createdAt)}
                  </div>
                  <div className="font-serif font-semibold text-[19px] leading-[1.25] text-navy">{k.title}</div>
                </div>
                <span
                  className="font-mono text-[11px] tracking-[.05em] uppercase px-3 py-1.5 rounded-[3px] border-[1.5px] whitespace-nowrap shrink-0"
                  style={{ borderColor: meta.color, color: meta.color, background: meta.bg }}
                >
                  {meta.label}
                </span>
              </div>
              {k.status === 'rejected' && (
                <div className="mt-3.5 bg-red/[.08] border-l-[3px] border-red px-3.5 py-3 text-[13px] text-navy">
                  <span className="font-mono text-[10.5px] tracking-[.06em] uppercase text-red block mb-1">Alasan penolakan</span>
                  {k.rejectionReason || 'Admin tidak menyertakan alasan.'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
