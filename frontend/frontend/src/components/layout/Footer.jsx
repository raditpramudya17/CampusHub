import React from 'react';

export default function Footer({ onToggleChat }) {
  const todayLabel = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <footer className="border-t-2 border-navy px-6 py-8 mt-auto">
      <div className="max-w-[1180px] mx-auto flex justify-between items-center flex-wrap gap-2.5 font-mono text-xs text-muted">
        <p className="m-0">MADING LOMBA — dibuat untuk mahasiswa, oleh mahasiswa.</p>
        <div className="flex gap-4">
          <a href="#/kalender" className="underline text-muted hover:text-red">Kalender</a>
          <a href="#/fame" className="underline text-muted hover:text-red">Wall of Fame</a>
          <button onClick={onToggleChat} className="underline text-muted hover:text-red bg-transparent border-none cursor-pointer font-mono text-xs p-0">
            Tanya MadingBot
          </button>
        </div>
        <p className="m-0">{todayLabel}</p>
      </div>
    </footer>
  );
}
