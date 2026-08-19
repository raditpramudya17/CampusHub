import React, { useEffect, useMemo, useState } from 'react';
import { CompetitionService } from '../services/competitionService';
import { extractErrorMessage } from '../services/errorUtils';
import { daysUntil, formatDateID, stubFor } from '../utils/format';
import CompetitionModal from '../components/CompetitionModal';

const DAY_HEADERS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

function toISODate(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export default function KalenderPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthOffset, setMonthOffset] = useState(0);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await CompetitionService.getAllUnpaged();
        if (!cancelled) setItems(result);
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const monthLabel = base.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const firstDow = (base.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();

  const cells = useMemo(() => {
    const list = [];
    for (let i = 0; i < firstDow; i++) list.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = toISODate(new Date(base.getFullYear(), base.getMonth(), d));
      const marks = [];
      items.forEach((c) => {
        const deadlineIso = c.registrationDeadline ? c.registrationDeadline.slice(0, 10) : null;
        const eventIso = c.eventDate ? c.eventDate.slice(0, 10) : null;
        if (deadlineIso === iso) marks.push({ id: c.id, label: '● ' + c.title, color: '#C0453A' });
        if (eventIso === iso) marks.push({ id: c.id, label: '● ' + c.title, color: '#5F7D6B' });
      });
      list.push({ day: d, iso, marks, isToday: iso === toISODate(today) });
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, monthOffset]);

  const openItem = useMemo(() => {
    const c = items.find((x) => x.id === openId);
    if (!c) return null;
    const days = daysUntil(c.registrationDeadline);
    const stub = stubFor(days);
    return {
      ...c,
      days,
      stubText: stub.text,
      stubColor: stub.color,
      deadlineFmt: formatDateID(c.registrationDeadline),
      eventFmt: c.eventDate ? formatDateID(c.eventDate) : 'Belum ditentukan',
    };
  }, [items, openId]);

  return (
    <section className="max-w-[1180px] mx-auto w-full px-6 py-12 flex-1">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="m-0 font-serif font-semibold text-[34px] text-navy">Kalender Lomba</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMonthOffset((v) => v - 1)}
            className="w-9 h-9 border-[1.5px] border-navy rounded-[3px] bg-transparent cursor-pointer font-mono hover:bg-navy hover:text-cream transition-colors"
          >
            ←
          </button>
          <span className="font-mono text-sm font-semibold min-w-[150px] text-center text-navy">{monthLabel}</span>
          <button
            onClick={() => setMonthOffset((v) => v + 1)}
            className="w-9 h-9 border-[1.5px] border-navy rounded-[3px] bg-transparent cursor-pointer font-mono hover:bg-navy hover:text-cream transition-colors"
          >
            →
          </button>
        </div>
        <div className="flex gap-4 font-mono text-[11px] text-muted">
          <span className="flex items-center gap-1.5"><span className="w-[9px] h-[9px] bg-red rounded-full" />deadline daftar</span>
          <span className="flex items-center gap-1.5"><span className="w-[9px] h-[9px] bg-green rounded-full" />hari acara</span>
        </div>
      </div>

      {error && <div className="text-red font-mono text-sm mb-4">{error}</div>}
      {loading && <div className="text-center py-16 font-mono text-sm text-muted">Memuat kalender…</div>}

      {!loading && (
        <div className="grid grid-cols-7 border-[1.5px] border-navy rounded-[4px] overflow-hidden bg-white">
          {DAY_HEADERS.map((h) => (
            <div key={h} className="p-2.5 bg-navy text-cream font-mono text-[11px] tracking-[.06em] uppercase text-center">
              {h}
            </div>
          ))}
          {cells.map((cell, i) => (
            <div
              key={i}
              className={
                'min-h-[92px] p-2 border-t border-line ' +
                (i % 7 === 0 ? '' : 'border-l border-line ') +
                (cell?.isToday ? 'bg-amber/[.15]' : cell?.marks?.length ? 'bg-[#FDFBF6]' : 'bg-white')
              }
            >
              {cell && (
                <>
                  <div className={'font-mono text-xs ' + (cell.isToday ? 'text-red' : 'text-navy')}>{cell.day}</div>
                  {cell.marks.map((m, j) => (
                    <div
                      key={j}
                      onClick={() => setOpenId(m.id)}
                      className="font-mono text-[9.5px] cursor-pointer mt-1 leading-[1.3] overflow-hidden line-clamp-2 hover:underline"
                      style={{ color: m.color }}
                    >
                      {m.label}
                    </div>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {openItem && <CompetitionModal item={openItem} onClose={() => setOpenId(null)} />}
    </section>
  );
}
