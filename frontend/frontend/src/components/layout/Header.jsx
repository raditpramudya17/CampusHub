import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import NavDrawer from './NavDrawer';

export default function Header() {
  const { isLoggedIn, isAdmin, role } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    ['#/papan', 'Papan'],
    ['#/kalender', 'Kalender'],
    ['#/fame', 'Wall of Fame'],
    ['#/cari-tim', 'Cari Tim'],
  ];
  if (isLoggedIn) navItems.push(['#/tersimpan', 'Tersimpan']);
  if (isLoggedIn) navItems.push(['#/kiriman', 'Kiriman Saya']);
  if (isAdmin) navItems.push(['#/admin', 'Moderasi']);

  const currentHash = typeof window !== 'undefined' ? (window.location.hash || '#/papan') : '#/papan';

  return (
    <header className="sticky top-0 z-50 bg-cream border-b-2 border-navy">
      <div className="max-w-[1180px] mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
        <a href="#/papan" className="flex items-baseline gap-2.5 no-underline shrink-0 min-w-0">
          <span className="font-serif font-bold text-2xl tracking-tight text-navy truncate">Mading Lomba</span>
          <span className="hidden sm:inline font-mono text-[10.5px] tracking-[.08em] uppercase text-muted border border-line px-[7px] py-[2px] rounded-[3px] shrink-0">
            v.{role}
          </span>
        </a>

        <div className="flex gap-2 items-center shrink-0">
          {isLoggedIn && <NotificationBell />}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Buka menu"
            aria-haspopup="true"
            aria-expanded={menuOpen}
            className="w-[38px] h-[38px] border-[1.5px] border-navy rounded-[3px] bg-transparent flex flex-col items-center justify-center gap-[4px] cursor-pointer hover:bg-navy transition-colors group"
          >
            <span className="w-[18px] h-[1.5px] bg-navy group-hover:bg-cream transition-colors" />
            <span className="w-[18px] h-[1.5px] bg-navy group-hover:bg-cream transition-colors" />
            <span className="w-[18px] h-[1.5px] bg-navy group-hover:bg-cream transition-colors" />
          </button>
        </div>
      </div>

      <NavDrawer open={menuOpen} onClose={() => setMenuOpen(false)} navItems={navItems} currentHash={currentHash} />
    </header>
  );
}
