import React, { useEffect, useMemo, useState } from 'react';
import { CompetitionService } from '../services/competitionService';
import { extractErrorMessage } from '../services/errorUtils';
import { daysUntil, formatDateID, stubFor } from '../utils/format';
import TicketCard from '../components/TicketCard';
import CompetitionModal from '../components/CompetitionModal';

const PREVIEW_COUNT = 4;

export default function PapanPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await CompetitionService.getAll({ size: PREVIEW_COUNT + 1 });
        if (!cancelled) setItems(result.data || []);
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const decorated = useMemo(() => {
    return items.map((c) => {
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
  }, [items]);

  const featured = decorated.find((c) => c.days >= 0) || decorated[0] || null;
  const preview = decorated.filter((c) => c.id !== featured?.id).slice(0, PREVIEW_COUNT);
  const openItem = decorated.find((c) => c.id === openId) || null;

  return (
    <>
      <section className="max-w-[1180px] mx-auto w-full px-6 pt-12 pb-9">
        <div className="flex items-center gap-2 font-mono text-xs tracking-[.12em] uppercase text-red mb-3.5">
          <span className="w-[7px] h-[7px] bg-red rounded-full" />
          Deadline terdekat minggu ini
        </div>
        <h1 className="m-0 mb-4 font-serif font-semibold text-[clamp(32px,5vw,54px)] leading-[1.05] tracking-tight max-w-[720px] text-navy">
          Semua lomba kampus, dalam satu papan.
        </h1>
        <p className="m-0 mb-7 text-base text-muted max-w-[560px]">
          Cari lomba sesuai minatmu, cek deadline pendaftaran, dan langsung ambil "tiket"-nya sebelum kehabisan waktu.
        </p>

        {featured && !loading && (
          <TicketCard item={featured} featured onOpen={() => setOpenId(featured.id)} />
        )}
      </section>

      <section className="max-w-[1180px] mx-auto w-full px-6 pb-20 flex-1">
        <div className="flex items-center justify-between gap-3.5 flex-wrap border-t-[1.5px] border-dashed border-line pt-5 mb-5">
          <h2 className="m-0 font-serif font-semibold text-2xl text-navy">Daftar Lomba</h2>
          <span className="font-mono text-xs text-muted">Terbaru</span>
        </div>

        {error && (
          <div className="text-center py-10 border-[1.5px] border-dashed border-red rounded-[4px] text-red mb-6">{error}</div>
        )}

        {!loading && !error && preview.length === 0 && (
          <div className="text-center py-16 px-5 border-[1.5px] border-dashed border-line rounded-[4px]">
            <div className="font-serif text-xl mb-2 text-navy">Belum ada lomba yang tayang.</div>
            <p className="m-0 text-muted text-sm">Jadilah yang pertama mengunggah lomba!</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 font-mono text-sm text-muted">Memuat lomba…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {preview.map((item) => (
              <TicketCard key={item.id} item={item} onOpen={() => setOpenId(item.id)} />
            ))}
          </div>
        )}

        {!loading && preview.length > 0 && (
          <div className="text-center mt-9">
            <a
              href="#/lomba"
              className="inline-block font-mono text-xs tracking-[.04em] uppercase px-6 py-3.5 border-[1.5px] border-navy rounded-[3px] bg-navy text-cream hover:bg-green hover:border-green transition-colors no-underline"
            >
              Lihat Lomba Lainnya →
            </a>
          </div>
        )}
      </section>

      {openItem && <CompetitionModal item={openItem} onClose={() => setOpenId(null)} />}
    </>
  );
}
