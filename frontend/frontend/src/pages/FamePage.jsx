import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AchievementService } from '../services/achievementService';
import { extractErrorMessage } from '../services/errorUtils';

const inputClass = 'w-full border-[1.5px] border-navy rounded-[3px] bg-white px-3 py-2.5 font-sans text-sm text-navy';
const labelClass = 'font-mono text-[10.5px] tracking-[.06em] uppercase text-muted mb-1.5 block';

const EMPTY_FORM = { title: '', teamOrUser: '', rank: '', year: new Date().getFullYear(), prodi: '', proofUrl: '', repoUrl: '', demoUrl: '' };

function ReportForm({ onSubmitted }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const canSubmit = form.title.trim() && form.teamOrUser.trim() && form.rank.trim() && form.year && form.prodi.trim();

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        teamOrUser: form.teamOrUser.trim(),
        rank: form.rank.trim(),
        year: Number(form.year),
        prodi: form.prodi.trim(),
      };
      if (form.proofUrl.trim()) payload.proofUrl = form.proofUrl.trim();
      if (form.repoUrl.trim()) payload.repoUrl = form.repoUrl.trim();
      if (form.demoUrl.trim()) payload.demoUrl = form.demoUrl.trim();
      await AchievementService.create(payload);
      setSuccess(true);
      setForm(EMPTY_FORM);
      onSubmitted?.();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-card border-[1.5px] border-navy rounded-[4px] p-6 flex flex-col gap-3.5 mb-8">
      {success && <div className="text-green text-sm font-mono">✓ Terkirim, menunggu moderasi admin.</div>}
      {error && <div className="text-red text-sm">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <span className={labelClass}>Nama lomba *</span>
          <input className={inputClass} placeholder="mis. GEMASTIK XIX — Divisi UX" value={form.title} onChange={update('title')} />
        </div>
        <div>
          <span className={labelClass}>Tim / individu *</span>
          <input className={inputClass} placeholder="mis. Tim Anemon: Rizky, Salsa" value={form.teamOrUser} onChange={update('teamOrUser')} />
        </div>
        <div>
          <span className={labelClass}>Peringkat *</span>
          <input className={inputClass} placeholder="mis. Juara 1 Nasional" value={form.rank} onChange={update('rank')} />
        </div>
        <div>
          <span className={labelClass}>Tahun *</span>
          <input type="number" className={inputClass} value={form.year} onChange={update('year')} />
        </div>
        <div>
          <span className={labelClass}>Program studi *</span>
          <input className={inputClass} placeholder="mis. Informatika" value={form.prodi} onChange={update('prodi')} />
        </div>
        <div>
          <span className={labelClass}>Link bukti/sertifikat (opsional)</span>
          <input className={inputClass} placeholder="https://…" value={form.proofUrl} onChange={update('proofUrl')} />
        </div>
        <div>
          <span className={labelClass}>Link repo/proposal (opsional)</span>
          <input className={inputClass} placeholder="https://github.com/…" value={form.repoUrl} onChange={update('repoUrl')} />
        </div>
        <div>
          <span className={labelClass}>Link demo (opsional)</span>
          <input className={inputClass} placeholder="https://…" value={form.demoUrl} onChange={update('demoUrl')} />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading || !canSubmit}
        className="self-start font-mono text-[12.5px] tracking-[.04em] uppercase px-5 py-2.5 border-none rounded-[3px] bg-navy text-cream cursor-pointer hover:bg-green transition-colors disabled:opacity-50"
      >
        {loading ? 'Mengirim…' : 'Lapor Prestasi'}
      </button>
    </form>
  );
}

export default function FamePage() {
  const { isLoggedIn } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await AchievementService.getAll();
      setItems(result.data || []);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="max-w-[1180px] mx-auto w-full px-6 py-12 flex-1">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3.5">
        <div className="flex items-center gap-2 font-mono text-xs tracking-[.12em] uppercase text-amber">★ Prestasi Kampus</div>
        {isLoggedIn && (
          <button
            onClick={() => setShowForm((s) => !s)}
            className="font-mono text-[11px] tracking-[.04em] uppercase px-4 py-2 border-[1.5px] border-navy rounded-[3px] bg-amber text-navy font-semibold cursor-pointer hover:bg-navy hover:text-cream transition-colors"
          >
            {showForm ? 'Tutup Form' : '+ Lapor Prestasi'}
          </button>
        )}
      </div>
      <h1 className="m-0 mb-2 font-serif font-semibold text-[38px] text-navy">Wall of Fame</h1>
      <p className="m-0 mb-6 text-muted max-w-[560px]">
        Mahasiswa dan tim yang mengharumkan nama kampus. Menang lomba? Laporkan prestasimu ke admin untuk dipajang di sini.
      </p>

      {!isLoggedIn && (
        <div className="mb-6 border-[1.5px] border-dashed border-line rounded-[4px] px-4 py-3 text-sm text-muted">
          <a href="#/auth" className="text-navy underline font-semibold">Masuk</a> untuk melaporkan prestasimu sendiri.
        </div>
      )}

      {showForm && <ReportForm onSubmitted={load} />}

      {error && <div className="text-red font-mono text-sm mb-5">{error}</div>}
      {loading && <div className="text-center py-16 font-mono text-sm text-muted">Memuat prestasi…</div>}

      {!loading && !error && items.length === 0 && (
        <div className="text-center py-16 px-5 border-[1.5px] border-dashed border-line rounded-[4px]">
          <div className="font-serif text-xl mb-2 text-navy">Belum ada prestasi yang dipajang.</div>
          <p className="m-0 text-muted text-sm">Jadilah yang pertama melaporkan prestasimu!</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {items.map((f) => (
            <div key={f.id} className="bg-card border-[1.5px] border-navy rounded-[4px] overflow-hidden flex flex-col transition-all duration-150 hover:-translate-y-[3px] hover:shadow-[5px_6px_0_#1E2A45]">
              <div
                className="h-[150px] shrink-0 flex items-center justify-center"
                style={{ backgroundImage: 'repeating-linear-gradient(135deg,#E5DCC3,#E5DCC3 8px,#DDD2B4 8px,#DDD2B4 16px)' }}
              >
                {f.proofUrl ? (
                  <a href={f.proofUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] text-navy bg-cream px-2.5 py-1 border border-line rounded-[3px] underline">
                    lihat bukti →
                  </a>
                ) : (
                  <span className="font-mono text-[11px] text-muted bg-cream px-2.5 py-1 border border-line rounded-[3px]">foto tim / dokumentasi</span>
                )}
              </div>
              <div className="p-4.5 border-t-[1.5px] border-navy flex-1 flex flex-col">
                <div>
                  <div className="font-mono text-[10px] tracking-[.08em] uppercase text-red mb-1.5">🏅 {f.rank}</div>
                  <div className="font-serif font-semibold text-[17px] leading-[1.25] mb-1.5 text-navy line-clamp-2">{f.title}</div>
                  <div className="text-[13px] text-muted line-clamp-1">{f.teamOrUser}</div>
                </div>
                <div className="mt-auto pt-2.5">
                  <div className="font-mono text-[11px] text-muted">{f.year} · {f.prodi}</div>
                  {(f.repoUrl || f.demoUrl) && (
                    <div className="flex gap-2.5 mt-2.5 flex-wrap">
                      {f.repoUrl && (
                        <a href={f.repoUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-[10.5px] text-navy underline">
                          ↗ Repo/Proposal
                        </a>
                      )}
                      {f.demoUrl && (
                        <a href={f.demoUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-[10.5px] text-navy underline">
                          ↗ Demo
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
