import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookmarkService } from '../services/bookmarkService';
import { extractErrorMessage } from '../services/errorUtils';
import { daysUntil, formatDateID, stubFor } from '../utils/format';
import TicketCard from '../components/TicketCard';
import CompetitionModal from '../components/CompetitionModal';

export default function TersimpanPage() {
  const { isLoggedIn, savedIds } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const saved = await BookmarkService.getMine();
        if (!cancelled) setItems(saved);
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isLoggedIn]);

  const decorated = useMemo(() => {
    return items
      // instantly hides an item once its heart is toggled off, without a refetch
      .filter((c) => savedIds.has(c.id))
      .map((c) => {
        const days = daysUntil(c.registrationDeadline);
        const stub = stubFor(days);
        return {
          ...c,
          days,
          stubText: stub.text,
          stubColor: stub.color,
          stubSub: stub.sub,
          deadlineFmt: formatDateID(c.registrationDeadline),
          eventFmt: c.eventDate ? formatDateID(c.eventDate) : 'Belum ditentukan',
        };
      });
  }, [items, savedIds]);

  const openItem = decorated.find((c) => c.id === openId) || null;

  if (!isLoggedIn) {
    return (
      <section className="max-w-[560px] mx-auto w-full px-6 py-16 flex-1 text-center">
        <h1 className="font-serif font-semibold text-3xl text-navy mb-3">Masuk dulu, yuk.</h1>
        <p className="text-muted mb-6">Masuk untuk melihat lomba yang kamu simpan.</p>
        <a href="#/auth" className="inline-block font-mono text-xs tracking-[.04em] uppercase px-6 py-3.5 border-none rounded-[3px] bg-navy text-cream hover:bg-green transition-colors">
          Masuk / Daftar
        </a>
      </section>
    );
  }

  return (
    <section className="max-w-[1180px] mx-auto w-full px-6 py-12 flex-1">
      <h1 className="m-0 mb-2 font-serif font-semibold text-[34px] text-navy">Lomba Tersimpan</h1>
      <p className="m-0 mb-7 text-muted">Lomba yang kamu simpan untuk dilihat lagi nanti.</p>

      {error && <div className="text-red font-mono text-sm mb-5">{error}</div>}
      {loading && <div className="text-center py-16 font-mono text-sm text-muted">Memuat lomba tersimpan…</div>}

      {!loading && !error && decorated.length === 0 && (
        <div className="text-center py-16 px-5 border-[1.5px] border-dashed border-line rounded-[4px]">
          <div className="font-serif text-xl mb-2 text-navy">Belum ada lomba tersimpan.</div>
          <p className="m-0 text-muted text-sm">
            Klik ikon ♡ di kartu lomba pada <a href="#/papan" className="underline text-navy">Papan Lomba</a> untuk menyimpannya di sini.
          </p>
        </div>
      )}

      {!loading && decorated.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
          {decorated.map((item) => (
            <TicketCard key={item.id} item={item} onOpen={() => setOpenId(item.id)} />
          ))}
        </div>
      )}

      {openItem && <CompetitionModal item={openItem} onClose={() => setOpenId(null)} />}
    </section>
  );
}
