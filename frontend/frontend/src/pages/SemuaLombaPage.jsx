import React, { useEffect, useMemo, useState } from 'react';
import { CompetitionService } from '../services/competitionService';
import { extractErrorMessage } from '../services/errorUtils';
import {
  daysUntil,
  formatDateID,
  stubFor,
  categoryLabel,
  CATEGORY_LABELS,
} from '../utils/format';
import TicketCard from '../components/TicketCard';
import CompetitionModal from '../components/CompetitionModal';

const PAGE_SIZE = 12;

const labelClass = 'font-mono text-[10.5px] tracking-[.06em] uppercase text-muted mb-1.5 block';
const selectClass = 'w-full border-[1.5px] border-navy rounded-[3px] bg-white px-3 py-2 font-sans text-[13px] text-navy';

const categoryBtn = (active) =>
  'w-full text-left font-mono text-[11.5px] tracking-[.03em] uppercase px-3 py-2 border-[1.5px] rounded-[3px] cursor-pointer transition-colors ' +
  (active ? 'bg-navy text-cream border-navy' : 'bg-transparent text-navy border-navy hover:bg-navy hover:text-cream');

const CATEGORY_KEYS = Object.keys(CATEGORY_LABELS);

const EMPTY_FILTERS = { q: '', category: 'Semua', closingOnly: false, fee: '', format: '', level: '' };

export default function SemuaLombaPage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);

  const buildParams = (targetPage) => {
    const params = { page: targetPage, size: PAGE_SIZE };
    if (filters.q.trim()) params.q = filters.q.trim();
    if (filters.category !== 'Semua') params.category = filters.category;
    if (filters.closingOnly) params.tab = 'closing';
    if (filters.fee) params.fee = filters.fee;
    if (filters.format) params.format = filters.format;
    if (filters.level) params.level = filters.level;
    return params;
  };

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      setPage(1);
      try {
        const result = await CompetitionService.getAll(buildParams(1));
        if (!cancelled) {
          setItems(result.data || []);
          setTotal(result.paging?.total ?? 0);
        }
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await CompetitionService.getAll(buildParams(nextPage));
      setItems((list) => [...list, ...(result.data || [])]);
      setTotal(result.paging?.total ?? total);
      setPage(nextPage);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  };

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

  const openItem = decorated.find((c) => c.id === openId) || null;
  const hasMore = items.length < total;
  const update = (patch) => setFilters((f) => ({ ...f, ...patch }));

  return (
    <>
      <section className="max-w-[1180px] mx-auto w-full px-6 py-12 flex-1">
        <div className="font-mono text-xs tracking-[.12em] uppercase text-red mb-2.5">Jelajahi</div>
        <h1 className="m-0 mb-2 font-serif font-semibold text-[34px] text-navy">Semua Lomba</h1>
        <p className="m-0 mb-8 text-muted max-w-[640px]">Saring lomba sesuai minatmu lewat panel di samping.</p>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <aside className="w-full lg:w-[260px] shrink-0 lg:sticky lg:top-[90px] flex flex-col gap-5">
            <div className="bg-card border-[1.5px] border-navy rounded-[4px] p-4.5">
              <span className={labelClass}>Cari</span>
              <input
                value={filters.q}
                onChange={(e) => update({ q: e.target.value })}
                placeholder="cari lomba..."
                className={selectClass}
              />
            </div>

            <div className="bg-card border-[1.5px] border-navy rounded-[4px] p-4.5">
              <span className={labelClass}>Kategori</span>
              <div className="flex flex-col gap-1.5">
                <button className={categoryBtn(filters.category === 'Semua')} onClick={() => update({ category: 'Semua' })}>
                  Semua
                </button>
                {CATEGORY_KEYS.map((key) => (
                  <button key={key} className={categoryBtn(filters.category === key)} onClick={() => update({ category: key })}>
                    {categoryLabel(key)}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card border-[1.5px] border-navy rounded-[4px] p-4.5">
              <span className={labelClass}>Biaya</span>
              <select className={selectClass + ' mb-3.5'} value={filters.fee} onChange={(e) => update({ fee: e.target.value })}>
                <option value="">Semua</option>
                <option value="gratis">Gratis</option>
                <option value="berbayar">Berbayar</option>
              </select>
              <span className={labelClass}>Format</span>
              <select className={selectClass + ' mb-3.5'} value={filters.format} onChange={(e) => update({ format: e.target.value })}>
                <option value="">Semua</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
              <span className={labelClass}>Level</span>
              <select className={selectClass} value={filters.level} onChange={(e) => update({ level: e.target.value })}>
                <option value="">Semua</option>
                <option value="kampus">Kampus</option>
                <option value="regional">Regional</option>
                <option value="nasional">Nasional</option>
                <option value="internasional">Internasional</option>
              </select>
            </div>

            <button
              onClick={() => update({ closingOnly: !filters.closingOnly })}
              className={
                'font-mono text-[11.5px] tracking-[.03em] uppercase px-3.5 py-2.5 border-[1.5px] rounded-[3px] cursor-pointer transition-colors ' +
                (filters.closingOnly ? 'bg-red text-white border-red' : 'bg-transparent text-navy border-navy hover:bg-navy hover:text-cream')
              }
            >
              ⏳ Segera Tutup
            </button>

            {(filters.q || filters.category !== 'Semua' || filters.closingOnly || filters.fee || filters.format || filters.level) && (
              <button
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="font-mono text-[11px] text-muted underline bg-transparent border-none cursor-pointer text-left"
              >
                Reset semua filter
              </button>
            )}
          </aside>

          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="font-mono text-xs text-muted">{loading ? 'Memuat…' : `${total} lomba ditemukan`}</span>
            </div>

            {error && (
              <div className="text-center py-10 border-[1.5px] border-dashed border-red rounded-[4px] text-red mb-6">{error}</div>
            )}

            {!loading && !error && decorated.length === 0 && (
              <div className="text-center py-16 px-5 border-[1.5px] border-dashed border-line rounded-[4px]">
                <div className="font-serif text-xl mb-2 text-navy">Belum ada lomba yang cocok.</div>
                <p className="m-0 text-muted text-sm">Coba ganti kata kunci atau kendurkan filter.</p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-16 font-mono text-sm text-muted">Memuat lomba…</div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
                {decorated.map((item) => (
                  <TicketCard key={item.id} item={item} onOpen={() => setOpenId(item.id)} />
                ))}
              </div>
            )}

            {!loading && hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="font-mono text-xs tracking-[.04em] uppercase px-6 py-3 border-[1.5px] border-navy rounded-[3px] bg-transparent text-navy hover:bg-navy hover:text-cream transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loadingMore ? 'Memuat…' : 'Muat Lebih Banyak'}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {openItem && <CompetitionModal item={openItem} onClose={() => setOpenId(null)} />}
    </>
  );
}
