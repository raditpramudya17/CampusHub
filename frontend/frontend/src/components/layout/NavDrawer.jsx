import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../utils/format';

export default function NavDrawer({ open, onClose, navItems, currentHash }) {
  const { isLoggedIn, user, role, logout } = useAuth();

  useEffect(() => {
    if (!open) return undefined;
    const onEsc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onEsc);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const handleLogout = async () => {
    onClose();
    await logout();
    window.location.hash = '#/papan';
  };

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={
          'fixed inset-0 bg-navy/50 z-[115] transition-opacity duration-200 ' +
          (open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')
        }
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi"
        className={
          'fixed top-0 right-0 h-full w-[300px] sm:w-[340px] bg-cream border-l-2 border-navy z-[120] flex flex-col shadow-[-6px_0_0_rgba(30,42,69,.08)] transition-transform duration-300 ease-out ' +
          (open ? 'translate-x-0' : 'translate-x-full')
        }
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b-[1.5px] border-dashed border-navy shrink-0">
          <span className="font-serif font-bold text-xl text-navy">Menu</span>
          <button
            onClick={onClose}
            aria-label="Tutup menu"
            className="w-8 h-8 border-[1.5px] border-navy rounded-full bg-transparent flex items-center justify-center cursor-pointer font-mono text-[14px] hover:bg-red hover:text-white hover:border-red transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
          {isLoggedIn ? (
            <div className="flex items-center gap-3 bg-card border-[1.5px] border-navy rounded-[4px] px-3.5 py-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-navy text-cream flex items-center justify-center font-mono text-xs border-[1.5px] border-navy">
                {initials(user ? `${user.firstName} ${user.lastName}` : user?.username)}
              </div>
              <div className="min-w-0">
                <div className="font-serif font-semibold text-navy truncate">{user?.firstName} {user?.lastName}</div>
                <div className="font-mono text-[10px] tracking-[.06em] uppercase text-muted truncate">{role} · {user?.email}</div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted">Masuk untuk unggah lomba, simpan, dan ikut diskusi.</div>
          )}

          <nav className="flex flex-col gap-1.5">
            {navItems.map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={onClose}
                className={
                  'font-mono text-[12px] tracking-[.03em] uppercase px-3.5 py-2.5 border-[1.5px] rounded-[3px] transition-colors ' +
                  (currentHash === href
                    ? 'bg-navy text-cream border-navy'
                    : 'bg-transparent text-navy border-navy hover:bg-navy hover:text-cream')
                }
              >
                {label}
              </a>
            ))}
          </nav>

          {isLoggedIn && (
            <a
              href="#/unggah"
              onClick={onClose}
              className="text-center font-mono text-xs tracking-[.04em] uppercase px-4 py-3 border-[1.5px] border-navy rounded-[3px] bg-amber text-navy font-semibold hover:bg-navy hover:text-cream transition-colors"
            >
              + Unggah Lomba
            </a>
          )}
        </div>

        <div className="px-5 py-5 border-t-[1.5px] border-dashed border-navy shrink-0">
          {isLoggedIn ? (
            <div className="flex flex-col gap-2.5">
              <a
                href="#/profil"
                onClick={onClose}
                className="text-center font-mono text-xs tracking-[.04em] uppercase px-4 py-3 border-[1.5px] border-navy rounded-[3px] bg-transparent text-navy hover:bg-navy hover:text-cream transition-colors"
              >
                Profil Saya
              </a>
              <button
                onClick={handleLogout}
                className="font-mono text-xs tracking-[.04em] uppercase px-4 py-3 border-[1.5px] border-red rounded-[3px] bg-transparent text-red hover:bg-red hover:text-white transition-colors cursor-pointer"
              >
                Keluar
              </button>
            </div>
          ) : (
            <a
              href="#/auth"
              onClick={onClose}
              className="block text-center font-mono text-xs tracking-[.04em] uppercase px-4 py-3 border-none rounded-[3px] bg-navy text-cream hover:bg-green transition-colors"
            >
              Masuk / Daftar
            </a>
          )}
        </div>
      </div>
    </>
  );
}
