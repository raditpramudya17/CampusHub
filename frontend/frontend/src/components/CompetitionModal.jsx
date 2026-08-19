import React, { useEffect } from 'react';
import { categoryLabel, feeLabel, formatLabel, levelLabel, isVerifiedOrganizer } from '../utils/format';
import { downloadICS } from '../utils/ics';
import { useAuth } from '../context/AuthContext';
import CommentThread from './CommentThread';

export default function CompetitionModal({ item, onClose }) {
  const { isLoggedIn, savedIds, toggleSave } = useAuth();
  const isSaved = savedIds.has(item?.id);

  useEffect(() => {
    const onEsc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [onClose]);

  if (!item) return null;

  const handleSave = () => {
    if (!isLoggedIn) {
      window.location.hash = '#/auth';
      return;
    }
    toggleSave(item.id).catch(() => {});
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Tautan disalin ke clipboard.');
      }
    } catch (e) {
      // user cancelled share — ignore
    }
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 bg-navy/55 flex items-start justify-center px-5 py-10 overflow-y-auto z-[100]"
    >
      <div className="bg-card border-2 border-navy rounded-[6px] max-w-[640px] w-full relative shadow-[8px_10px_0_rgba(30,42,69,.25)]">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-8 h-8 border-[1.5px] border-navy rounded-full bg-cream flex items-center justify-center cursor-pointer font-mono text-[15px] z-[2] hover:bg-red hover:text-white transition-colors"
        >
          ✕
        </button>
        {item.posterUrl && (
          <img src={item.posterUrl} alt={`Poster ${item.title}`} className="w-full max-h-[280px] object-cover rounded-t-[4px]" />
        )}
        <div className="px-8 pt-8 pb-6 border-b-[1.5px] border-dashed border-navy relative">
          <div className="flex items-center gap-2 flex-wrap mb-2.5">
            <span className="font-mono text-[11px] tracking-[.08em] uppercase text-muted">{categoryLabel(item.category)}</span>
            {isVerifiedOrganizer(item.authorRole) && (
              <span title="Diunggah oleh organisasi resmi kampus" className="font-mono text-[10px] tracking-[.04em] uppercase px-2 py-[3px] rounded-[3px] bg-green/[.15] text-green font-semibold">✓ Terverifikasi Kampus</span>
            )}
          </div>
          <div className="font-serif font-bold text-[27px] leading-[1.15] mb-2 pr-9 text-navy">{item.title}</div>
          <div className="text-muted text-[14.5px] mb-2">{item.organizer}{item.location ? ` · ${item.location}` : ''}</div>
          {(item.fee || item.format || item.level || (item.tags && item.tags.length > 0)) && (
            <div className="flex gap-1.5 flex-wrap">
              {item.fee && <span className="font-mono text-[10px] uppercase tracking-[.04em] px-2 py-1 rounded-[3px] bg-navy/[.06] text-muted">{feeLabel(item.fee)}</span>}
              {item.format && <span className="font-mono text-[10px] uppercase tracking-[.04em] px-2 py-1 rounded-[3px] bg-navy/[.06] text-muted">{formatLabel(item.format)}</span>}
              {item.level && <span className="font-mono text-[10px] uppercase tracking-[.04em] px-2 py-1 rounded-[3px] bg-navy/[.06] text-muted">{levelLabel(item.level)}</span>}
              {(item.tags || []).map((t) => (
                <span key={t} className="font-mono text-[10px] uppercase tracking-[.04em] px-2 py-1 rounded-[3px] bg-amber/20 text-navy">#{t}</span>
              ))}
            </div>
          )}
        </div>
        <div className="px-8 pt-6 pb-8">
          <div className="flex gap-3.5 mb-4 flex-wrap">
            <div className="flex-1 min-w-[140px]">
              <div className="font-mono text-[10.5px] tracking-[.06em] uppercase text-muted mb-1">Deadline Daftar</div>
              <div className="text-[15px] font-medium text-red font-mono">{item.deadlineFmt} · {item.stubText}</div>
            </div>
            <div className="flex-1 min-w-[140px]">
              <div className="font-mono text-[10.5px] tracking-[.06em] uppercase text-muted mb-1">Tanggal Acara</div>
              <div className="text-[15px] font-medium text-navy">{item.eventFmt}</div>
            </div>
          </div>
          <div className="mb-4">
            <div className="font-mono text-[10.5px] tracking-[.06em] uppercase text-muted mb-1">Hadiah</div>
            <div className="text-[15px] font-medium text-navy">{item.prize || '-'}</div>
          </div>
          <p className="text-[15px] text-muted leading-relaxed mb-5">{item.description}</p>
          {item.requirements && (
            <div className="text-[14.5px] mb-6 bg-navy/[.04] border-l-[3px] border-amber px-3.5 py-3">
              <div className="font-mono text-[10.5px] tracking-[.06em] uppercase text-muted mb-1.5">Syarat Peserta</div>
              <span className="text-navy">{item.requirements}</span>
            </div>
          )}
          <div className="flex flex-col gap-2.5">
            <a
              href={item.registrationLink || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-navy text-cream font-mono text-[13.5px] tracking-[.04em] uppercase px-5 py-3.5 rounded-[3px] justify-center no-underline hover:bg-green transition-colors"
            >
              Daftar Sekarang →
            </a>
            <div className="flex gap-2.5 flex-wrap">
              <button
                onClick={handleSave}
                className={
                  'flex-1 font-mono cursor-pointer text-[13px] tracking-[.04em] uppercase px-4 py-3 rounded-[3px] border-[1.5px] border-navy transition-colors ' +
                  (isSaved ? 'bg-amber text-navy' : 'bg-transparent text-navy hover:bg-amber')
                }
              >
                {isSaved ? '♥ Tersimpan' : '♡ Simpan'}
              </button>
              <button
                onClick={() => downloadICS(item)}
                className="flex-1 font-mono cursor-pointer text-[13px] tracking-[.04em] uppercase px-4 py-3 rounded-[3px] border-[1.5px] border-navy bg-transparent text-navy hover:bg-amber transition-colors"
              >
                + Kalender
              </button>
              <button
                onClick={share}
                className="flex-1 font-mono cursor-pointer text-[13px] tracking-[.04em] uppercase px-4 py-3 rounded-[3px] border-[1.5px] border-navy bg-transparent text-navy hover:bg-amber transition-colors"
              >
                Bagikan
              </button>
            </div>
          </div>
          <CommentThread competitionId={item.id} />
        </div>
      </div>
    </div>
  );
}
