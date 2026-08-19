import React from 'react';
import { categoryLabel, feeLabel, formatLabel, levelLabel } from '../utils/format';
import { useAuth } from '../context/AuthContext';

/**
 * Ticket-stub styled competition card.
 * `featured` renders the larger hero variant used at the top of Papan Lomba.
 */
export default function TicketCard({ item, onOpen, featured = false }) {
  const { isLoggedIn, savedIds, toggleSave } = useAuth();
  const isSaved = savedIds.has(item.id);
  const stubWidth = featured ? 'w-[28%] min-w-[130px]' : 'w-[26%]';
  const notchLeft = featured ? 'left-[calc(78%-8px)]' : 'left-[calc(74%-8px)]';

  const handleSaveClick = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      window.location.hash = '#/auth';
      return;
    }
    toggleSave(item.id).catch(() => {
      // optimistic update already rolled back inside toggleSave on failure
    });
  };

  return (
    <div
      onClick={onOpen}
      className="bg-card border-[1.5px] border-navy rounded-[4px] flex cursor-pointer relative overflow-hidden transition-all duration-150 hover:-translate-y-[3px] hover:bg-cardhover hover:shadow-[5px_6px_0_#1E2A45]"
    >
      <button
        onClick={handleSaveClick}
        title={isSaved ? 'Hapus dari simpanan' : 'Simpan lomba'}
        className="absolute top-2.5 right-2.5 z-[1] w-8 h-8 rounded-full bg-cream border-[1.5px] border-navy flex items-center justify-center text-[14px] hover:bg-amber transition-colors"
      >
        {isSaved ? '♥' : '♡'}
      </button>
      <div className={(featured ? 'p-7' : 'p-5') + ' flex-1 flex flex-col justify-between min-w-0'}>
        <div>
          <div className="flex items-center gap-2.5 mb-2 flex-wrap pr-8">
            <span className="font-mono text-[10px] tracking-[.08em] uppercase text-muted">{categoryLabel(item.category)}</span>
            {featured && (
              <span className="font-mono text-[10px] tracking-[.08em] uppercase bg-amber text-navy px-2 py-[3px] rounded-[3px] font-semibold">★ Sorotan</span>
            )}
          </div>
          <div className={(featured ? 'text-[27px]' : 'text-lg line-clamp-2') + ' font-serif font-semibold leading-[1.2] mb-2 text-navy'}>
            {item.title}
          </div>
          <div className={(featured ? 'text-sm' : 'text-[13.5px]') + ' text-muted mb-1.5 line-clamp-1'}>{item.organizer}</div>
          {(item.fee || item.format || item.level) && (
            <div className="flex gap-1.5 flex-wrap mb-2">
              {item.fee && <span className="font-mono text-[9.5px] uppercase tracking-[.04em] px-1.5 py-0.5 rounded-[3px] bg-navy/[.06] text-muted">{feeLabel(item.fee)}</span>}
              {item.format && <span className="font-mono text-[9.5px] uppercase tracking-[.04em] px-1.5 py-0.5 rounded-[3px] bg-navy/[.06] text-muted">{formatLabel(item.format)}</span>}
              {item.level && <span className="font-mono text-[9.5px] uppercase tracking-[.04em] px-1.5 py-0.5 rounded-[3px] bg-navy/[.06] text-muted">{levelLabel(item.level)}</span>}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1 font-mono text-[11.5px] text-muted mt-3">
          <span>Daftar ≤ {item.deadlineFmt}</span>
          <span>Acara: {item.eventFmt}</span>
        </div>
      </div>

      <div
        className={stubWidth + ' border-l-[1.5px] border-dashed border-navy flex flex-col items-center justify-center px-2 py-3.5 text-center shrink-0'}
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, transparent, transparent 6px, rgba(30,42,69,.03) 6px, rgba(30,42,69,.03) 7px)',
        }}
      >
        <div className={(featured ? 'text-[36px]' : 'text-2xl') + ' font-mono font-semibold leading-none'} style={{ color: item.stubColor }}>
          {item.stubText}
        </div>
        <div className="font-mono text-[9px] tracking-[.06em] uppercase text-muted mt-1">{item.stubSub}</div>
      </div>

      <span className={'absolute w-4 h-4 bg-cream rounded-full border-[1.5px] border-navy -top-[9px] ' + notchLeft} />
      <span className={'absolute w-4 h-4 bg-cream rounded-full border-[1.5px] border-navy -bottom-[9px] ' + notchLeft} />
    </div>
  );
}
