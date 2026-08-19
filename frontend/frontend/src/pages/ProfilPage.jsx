import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserService } from '../services/userService';
import { extractErrorMessage } from '../services/errorUtils';
import { initials } from '../utils/format';

const inputClass = 'w-full border-[1.5px] border-navy rounded-[3px] bg-white px-3 py-2.5 font-sans text-sm text-navy';
const labelClass = 'font-mono text-[10.5px] tracking-[.06em] uppercase text-muted mb-1.5 block';

export default function ProfilPage() {
  const { user, isLoggedIn, refreshUser } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);
  const [profileErr, setProfileErr] = useState(null);

  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);
  const [pwErr, setPwErr] = useState(null);

  if (!isLoggedIn || !user) {
    return (
      <section className="max-w-[560px] mx-auto w-full px-6 py-16 flex-1 text-center">
        <h1 className="font-serif font-semibold text-3xl text-navy mb-3">Masuk dulu, yuk.</h1>
        <p className="text-muted mb-6">Masuk untuk melihat dan mengubah profilmu.</p>
        <a href="#/auth" className="inline-block font-mono text-xs tracking-[.04em] uppercase px-6 py-3.5 border-none rounded-[3px] bg-navy text-cream hover:bg-green transition-colors">
          Masuk / Daftar
        </a>
      </section>
    );
  }

  const submitProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileErr(null);
    setProfileMsg(null);
    try {
      await UserService.updateMe(form);
      await refreshUser();
      setProfileMsg('Profil berhasil diperbarui.');
    } catch (err) {
      setProfileErr(extractErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    setPwErr(null);
    setPwMsg(null);
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwErr('Konfirmasi password baru tidak cocok.');
      return;
    }
    setSavingPw(true);
    try {
      await UserService.updatePassword(pwForm.oldPassword, pwForm.newPassword, pwForm.confirmPassword);
      setPwMsg('Password berhasil diperbarui.');
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwErr(extractErrorMessage(err));
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <section className="max-w-[640px] mx-auto w-full px-6 py-12 flex-1">
      <h1 className="m-0 mb-7 font-serif font-semibold text-[34px] text-navy">Profil Saya</h1>

      <div className="bg-card border-[1.5px] border-navy rounded-[4px] p-7 flex flex-col gap-4.5">
        <div className="flex items-center gap-4 border-b-[1.5px] border-dashed border-navy pb-4.5">
          <div className="w-16 h-16 rounded-full bg-navy text-cream flex items-center justify-center font-mono text-xl">
            {initials(`${user.firstName} ${user.lastName}`)}
          </div>
          <div>
            <div className="font-serif font-semibold text-xl text-navy">{user.firstName} {user.lastName}</div>
            <div className="font-mono text-[11.5px] text-muted">{user.role} · {user.email}</div>
          </div>
        </div>

        <form onSubmit={submitProfile} className="flex flex-col gap-4.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <span className={labelClass}>Nama depan</span>
              <input className={inputClass} value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
            </div>
            <div>
              <span className={labelClass}>Nama belakang</span>
              <input className={inputClass} value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
            </div>
          </div>
          <div>
            <span className={labelClass}>Username</span>
            <input className={inputClass} value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
          </div>
          <div>
            <span className={labelClass}>Email kampus</span>
            <input className={inputClass + ' opacity-60 cursor-not-allowed'} value={user.email} disabled />
          </div>

          {profileErr && <div className="text-red text-sm">{profileErr}</div>}
          {profileMsg && <div className="text-green text-sm">{profileMsg}</div>}

          <button
            type="submit"
            disabled={savingProfile}
            className="font-mono text-xs tracking-[.04em] uppercase p-3.5 border-none rounded-[3px] bg-navy text-cream cursor-pointer hover:bg-green transition-colors disabled:opacity-50"
          >
            {savingProfile ? 'Menyimpan…' : 'Simpan Perubahan'}
          </button>
        </form>

        <div className="border-t-[1.5px] border-dashed border-navy pt-4.5">
          <h3 className="m-0 mb-3 font-serif font-semibold text-lg text-navy">Ubah Password</h3>
          <form onSubmit={submitPassword} className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="Password lama"
              className={inputClass}
              value={pwForm.oldPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, oldPassword: e.target.value }))}
            />
            <input
              type="password"
              placeholder="Password baru (min. 8 karakter)"
              className={inputClass}
              value={pwForm.newPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
            />
            <input
              type="password"
              placeholder="Ulangi password baru"
              className={inputClass}
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            />
            {pwErr && <div className="text-red text-sm">{pwErr}</div>}
            {pwMsg && <div className="text-green text-sm">{pwMsg}</div>}
            <button
              type="submit"
              disabled={savingPw}
              className="font-mono text-[12.5px] tracking-[.04em] uppercase p-3.5 border-[1.5px] border-navy rounded-[3px] bg-transparent text-navy cursor-pointer hover:bg-navy hover:text-cream transition-colors disabled:opacity-50"
            >
              {savingPw ? 'Memperbarui…' : 'Perbarui Password'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
