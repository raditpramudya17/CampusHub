import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { NotificationService } from '../../services/notificationService';

const POLL_MS = 60000;

const TYPE_ICON = {
  submission_approved: '✓',
  submission_rejected: '✕',
  deadline_reminder: '⏰',
  new_in_category: '★',
};

function timeAgoID(dateStr) {
  const minutes = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (minutes < 1) return 'baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}

export default function NotificationBell() {
  const { isLoggedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await NotificationService.getMine({ size: 20 });
      setItems(result.data || []);
      setUnreadCount(result.unreadCount || 0);
    } catch {
      // notifikasi bersifat non-blocking, gagal diam-diam
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return undefined;
    load();
    const interval = setInterval(load, POLL_MS);
    return () => clearInterval(interval);
  }, [isLoggedIn, load]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  if (!isLoggedIn) return null;

  const handleClickItem = (item) => {
    if (!item.read) {
      setItems((list) => list.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
      NotificationService.markRead(item.id).catch(() => {});
    }
    setOpen(false);
    if (item.link) window.location.hash = item.link.replace(/^#/, '');
  };

  const handleMarkAllRead = async () => {
    setItems((list) => list.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await NotificationService.markAllRead();
    } catch {
      load();
    }
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifikasi"
        className="relative w-[38px] h-[38px] rounded-full border-[1.5px] border-navy bg-transparent text-navy flex items-center justify-center hover:bg-navy hover:text-cream transition-colors cursor-pointer"
      >
        <span aria-hidden>🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red text-white font-mono text-[10px] flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[340px] max-w-[calc(100vw-2rem)] max-h-[420px] overflow-y-auto bg-card border-[1.5px] border-navy rounded-[4px] shadow-[5px_6px_0_#1E2A45] z-50">
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-line sticky top-0 bg-card">
            <span className="font-mono text-[11px] tracking-[.06em] uppercase text-navy">Notifikasi</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="font-mono text-[10.5px] text-muted hover:text-navy underline bg-transparent border-none cursor-pointer"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          {loading && items.length === 0 ? (
            <div className="py-8 text-center font-mono text-[12px] text-muted">Memuat…</div>
          ) : items.length === 0 ? (
            <div className="py-8 text-center font-mono text-[12px] text-muted">Belum ada notifikasi.</div>
          ) : (
            <div className="flex flex-col">
              {items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClickItem(n)}
                  className={
                    'text-left px-4 py-3 border-b border-line last:border-b-0 flex gap-2.5 items-start hover:bg-navy/[.04] transition-colors cursor-pointer bg-transparent border-x-0 border-t-0 ' +
                    (n.read ? '' : 'bg-amber/10')
                  }
                >
                  <span className="text-base leading-none mt-0.5">{TYPE_ICON[n.type] || '•'}</span>
                  <span className="min-w-0 flex-1">
                    <span className={'block text-[13px] leading-snug ' + (n.read ? 'text-muted' : 'text-navy font-semibold')}>
                      {n.title}
                    </span>
                    <span className="block text-[12px] text-muted mt-0.5 line-clamp-2">{n.message}</span>
                    <span className="block font-mono text-[10px] text-muted mt-1">{timeAgoID(n.createdAt)}</span>
                  </span>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-red mt-1.5 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
