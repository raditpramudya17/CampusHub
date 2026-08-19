import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CompetitionService } from '../services/competitionService';
import { extractErrorMessage } from '../services/errorUtils';
import { CATEGORY_LABELS, FEE_LABELS, FORMAT_LABELS, LEVEL_LABELS } from '../utils/format';
import PosterDropzone from '../components/PosterDropzone';

const inputClass = 'w-full border-[1.5px] border-navy rounded-[3px] bg-white px-3 py-2.5 font-sans text-sm text-navy';
const monoInputClass = 'w-full border-[1.5px] border-navy rounded-[3px] bg-white px-3 py-2.5 font-mono text-[13px] text-navy';
const labelClass = 'font-mono text-[10.5px] tracking-[.06em] uppercase text-muted mb-1.5 block';

const EMPTY_FORM = {
  title: '',
  category: 'teknologi',
  organizer: '',
  registrationDeadline: '',
  eventDate: '',
  prize: '',
  description: '',
  requirements: '',
  registrationLink: '',
  fee: '',
  format: '',
  level: '',
  tags: '',
  location: '',
  posterUrl: '',
};

export default function UnggahPage() {
  const { isLoggedIn } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const canSubmit =
    form.title.trim() && form.category && form.organizer.trim() && form.registrationDeadline &&
    form.description.trim() && form.requirements.trim() && form.registrationLink.trim();

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      setError('Lengkapi semua kolom wajib (bertanda *).');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        organizer: form.organizer.trim(),
        registrationDeadline: form.registrationDeadline,
        registrationLink: form.registrationLink.trim(),
        requirements: form.requirements.trim(),
      };
      if (form.eventDate) payload.eventDate = form.eventDate;
      if (form.prize.trim()) payload.prize = form.prize.trim();
      if (form.fee) payload.fee = form.fee;
      if (form.format) payload.format = form.format;
      if (form.level) payload.level = form.level;
      if (form.location.trim()) payload.location = form.location.trim();
      if (form.tags.trim()) {
        payload.tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 10);
      }
      if (form.posterUrl) payload.posterUrl = form.posterUrl;
      await CompetitionService.create(payload);
      setSuccess(true);
      setForm(EMPTY_FORM);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <section className="max-w-[560px] mx-auto w-full px-6 py-16 flex-1 text-center">
        <h1 className="font-serif font-semibold text-3xl text-navy mb-3">Masuk dulu, yuk.</h1>
        <p className="text-muted mb-6">Kamu perlu masuk atau daftar akun untuk mengunggah lomba ke papan.</p>
        <a href="#/auth" className="inline-block font-mono text-xs tracking-[.04em] uppercase px-6 py-3.5 border-none rounded-[3px] bg-navy text-cream hover:bg-green transition-colors">
          Masuk / Daftar
        </a>
      </section>
    );
  }

  return (
    <section className="max-w-[760px] mx-auto w-full px-6 py-12 flex-1">
      <h1 className="m-0 mb-2 font-serif font-semibold text-[34px] text-navy">Unggah Lomba</h1>
      <p className="m-0 mb-7 text-muted">Isi detail lomba di bawah. Kiriman akan ditinjau moderator (± 24 jam) sebelum tampil di papan.</p>

      {success && (
        <div className="bg-green/[.12] border-[1.5px] border-green rounded-[4px] px-5 py-4.5 mb-6">
          <div className="font-mono text-[11px] tracking-[.08em] uppercase text-green mb-1">✓ Terkirim</div>
          <div className="text-[14.5px] text-navy">
            Lomba kamu masuk antrean moderasi. Pantau statusnya di <a href="#/kiriman" className="text-green font-semibold underline">Kiriman Saya</a>.
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red/[.08] border-[1.5px] border-red rounded-[4px] px-5 py-3.5 mb-6 text-sm text-red">{error}</div>
      )}

      <form onSubmit={submit} className="bg-card border-[1.5px] border-navy rounded-[4px] p-7 flex flex-col gap-4.5">
        <div>
          <span className={labelClass}>Judul lomba *</span>
          <input className={inputClass} placeholder="mis. Lomba Esai Nasional 2026" value={form.title} onChange={update('title')} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <span className={labelClass}>Kategori *</span>
            <select className={inputClass} value={form.category} onChange={update('category')}>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <span className={labelClass}>Penyelenggara *</span>
            <input className={inputClass} placeholder="mis. BEM Fakultas Teknik" value={form.organizer} onChange={update('organizer')} />
          </div>
          <div>
            <span className={labelClass}>Deadline daftar *</span>
            <input type="date" className={monoInputClass} value={form.registrationDeadline} onChange={update('registrationDeadline')} />
          </div>
          <div>
            <span className={labelClass}>Tanggal acara</span>
            <input type="date" className={monoInputClass} value={form.eventDate} onChange={update('eventDate')} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <span className={labelClass}>Biaya</span>
            <select className={inputClass} value={form.fee} onChange={update('fee')}>
              <option value="">Tidak diisi</option>
              {Object.entries(FEE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <span className={labelClass}>Format</span>
            <select className={inputClass} value={form.format} onChange={update('format')}>
              <option value="">Tidak diisi</option>
              {Object.entries(FORMAT_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <span className={labelClass}>Level</span>
            <select className={inputClass} value={form.level} onChange={update('level')}>
              <option value="">Tidak diisi</option>
              {Object.entries(LEVEL_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <span className={labelClass}>Lokasi (untuk lomba offline/hybrid)</span>
          <input className={inputClass} placeholder="mis. Gedung Rektorat Unismuh Makassar" value={form.location} onChange={update('location')} />
        </div>

        <div>
          <span className={labelClass}>Tag (pisahkan dengan koma)</span>
          <input className={inputClass} placeholder="mis. ai, web, mobile" value={form.tags} onChange={update('tags')} />
        </div>

        <div>
          <span className={labelClass}>Hadiah</span>
          <input className={inputClass} placeholder="mis. Rp 10.000.000 + sertifikat" value={form.prize} onChange={update('prize')} />
        </div>

        <div>
          <span className={labelClass}>Deskripsi *</span>
          <textarea rows={4} className={inputClass + ' resize-y'} placeholder="Jelaskan lomba secara singkat: format, babak, siapa yang bisa ikut…" value={form.description} onChange={update('description')} />
        </div>

        <div>
          <span className={labelClass}>Syarat peserta *</span>
          <textarea rows={3} className={inputClass + ' resize-y'} placeholder="mis. Tim 2–4 orang, mahasiswa aktif D3/S1…" value={form.requirements} onChange={update('requirements')} />
        </div>

        <div>
          <span className={labelClass}>Link pendaftaran *</span>
          <input className={monoInputClass} placeholder="https://…" value={form.registrationLink} onChange={update('registrationLink')} />
        </div>

        <PosterDropzone value={form.posterUrl} onUploaded={(url) => setForm((f) => ({ ...f, posterUrl: url }))} />

        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="font-mono text-[13.5px] tracking-[.04em] uppercase p-4 border-none rounded-[3px] bg-navy text-cream cursor-pointer hover:bg-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Mengirim…' : 'Kirim untuk Moderasi →'}
        </button>
      </form>
    </section>
  );
}
