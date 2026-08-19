import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/authService';
import { extractErrorMessage } from '../services/errorUtils';
import GoogleLoginButton from '../components/GoogleLoginButton';

const inputClass = 'w-full border-[1.5px] border-navy rounded-[3px] bg-white px-3 py-3 font-sans text-sm text-navy';
const primaryBtn = 'font-mono text-[13px] tracking-[.04em] uppercase p-3.5 border-none rounded-[3px] bg-navy text-cream cursor-pointer hover:bg-green transition-colors disabled:opacity-50';
const linkBtn = 'font-mono text-[11.5px] border-none bg-none text-muted cursor-pointer underline p-0 self-center';

const tabBtn = (active) =>
  'flex-1 font-mono text-xs tracking-[.06em] uppercase p-3.5 border-none cursor-pointer transition-colors ' +
  (active ? 'bg-navy text-cream' : 'bg-transparent text-navy hover:bg-navy/10');

export default function AuthPage() {
  const { login, loginWithGoogle } = useAuth();
  const [tab, setTab] = useState('masuk'); // masuk | daftar | verifikasi | lupa
  const [lupaStep, setLupaStep] = useState('email'); // email | code | reset
  const [googleErr, setGoogleErr] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginErr, setLoginErr] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [regForm, setRegForm] = useState({ firstName: '', lastName: '', email: '', username: '', password: '', confirmPassword: '', gender: 'male' });
  const [regErr, setRegErr] = useState(null);
  const [regLoading, setRegLoading] = useState(false);

  const [verifyToken, setVerifyToken] = useState('');
  const [verifyMsg, setVerifyMsg] = useState(null);
  const [verifyErr, setVerifyErr] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownTimer = useRef(null);

  const [lupaEmail, setLupaEmail] = useState('');
  const [lupaCode, setLupaCode] = useState('');
  const [lupaToken, setLupaToken] = useState('');
  const [lupaPw, setLupaPw] = useState({ password: '', confirmPassword: '' });
  const [lupaErr, setLupaErr] = useState(null);
  const [lupaMsg, setLupaMsg] = useState(null);
  const [lupaLoading, setLupaLoading] = useState(false);

  const submitLogin = async (e) => {
    e.preventDefault();
    setLoginErr(null);
    setLoginLoading(true);
    try {
      await login(loginForm.username, loginForm.password);
      window.location.hash = '#/papan';
    } catch (err) {
      setLoginErr(extractErrorMessage(err));
    } finally {
      setLoginLoading(false);
    }
  };

  const submitRegister = async (e) => {
    e.preventDefault();
    setRegErr(null);
    if (regForm.password !== regForm.confirmPassword) {
      setRegErr('Konfirmasi password tidak cocok.');
      return;
    }
    setRegLoading(true);
    try {
      await AuthService.register(regForm);
      setTab('verifikasi');
    } catch (err) {
      setRegErr(extractErrorMessage(err));
    } finally {
      setRegLoading(false);
    }
  };

  const handleGoogleCredential = async (idToken) => {
    setGoogleErr(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle(idToken);
      window.location.hash = '#/papan';
    } catch (err) {
      setGoogleErr(extractErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  const startCooldown = (secs) => {
    setResendCooldown(secs);
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    cooldownTimer.current = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) { clearInterval(cooldownTimer.current); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  const submitVerify = async (e) => {
    e.preventDefault();
    setVerifyErr(null);
    setVerifyMsg(null);
    if (!verifyToken.trim()) { setVerifyErr('Masukkan token dari email verifikasi.'); return; }
    setVerifyLoading(true);
    try {
      await AuthService.verifyEmail(verifyToken.trim());
      setVerifyMsg('Email berhasil diverifikasi. Silakan masuk.');
      setTimeout(() => setTab('masuk'), 1500);
    } catch (err) {
      setVerifyErr(extractErrorMessage(err));
    } finally {
      setVerifyLoading(false);
    }
  };

  const resendVerify = async () => {
    if (!regForm.email) { setVerifyErr('Isi email di form Daftar terlebih dahulu.'); return; }
    setVerifyErr(null);
    setVerifyLoading(true);
    try {
      await AuthService.resendVerifyEmail(regForm.email);
      setVerifyMsg('Email verifikasi telah dikirim ulang.');
      startCooldown(60);
    } catch (err) {
      setVerifyErr(extractErrorMessage(err));
    } finally {
      setVerifyLoading(false);
    }
  };

  const submitLupaEmail = async (e) => {
    e.preventDefault();
    setLupaErr(null);
    setLupaLoading(true);
    try {
      await AuthService.forgotPassword(lupaEmail.trim());
      setLupaStep('code');
    } catch (err) {
      setLupaErr(extractErrorMessage(err));
    } finally {
      setLupaLoading(false);
    }
  };

  const submitLupaCode = async (e) => {
    e.preventDefault();
    setLupaErr(null);
    setLupaLoading(true);
    try {
      const result = await AuthService.verifyCode(lupaEmail.trim(), Number(lupaCode));
      setLupaToken(result.token);
      setLupaStep('reset');
    } catch (err) {
      setLupaErr(extractErrorMessage(err));
    } finally {
      setLupaLoading(false);
    }
  };

  const submitLupaReset = async (e) => {
    e.preventDefault();
    setLupaErr(null);
    if (lupaPw.password !== lupaPw.confirmPassword) {
      setLupaErr('Konfirmasi password tidak cocok.');
      return;
    }
    setLupaLoading(true);
    try {
      await AuthService.resetPassword(lupaToken, lupaPw.password, lupaPw.confirmPassword);
      setLupaMsg('Password berhasil direset. Silakan masuk dengan password baru.');
      setTimeout(() => { setTab('masuk'); setLupaStep('email'); }, 1500);
    } catch (err) {
      setLupaErr(extractErrorMessage(err));
    } finally {
      setLupaLoading(false);
    }
  };

  return (
    <section className="max-w-[460px] mx-auto w-full px-6 py-14 flex-1">
      <div className="bg-card border-2 border-navy rounded-[6px] overflow-hidden shadow-[6px_8px_0_rgba(30,42,69,.18)]">
        <div className="flex border-b-[1.5px] border-navy">
          <button className={tabBtn(tab === 'masuk' || tab === 'lupa')} onClick={() => setTab('masuk')}>Masuk</button>
          <button className={tabBtn(tab === 'daftar' || tab === 'verifikasi')} onClick={() => setTab('daftar')}>Daftar</button>
        </div>

        <div className="p-7">
          {tab === 'masuk' && (
            <>
              <form onSubmit={submitLogin} className="flex flex-col gap-3.5">
                <div className="font-serif font-semibold text-[22px] text-navy">Selamat datang kembali.</div>
                <input className={inputClass} placeholder="Username" value={loginForm.username} onChange={(e) => setLoginForm((f) => ({ ...f, username: e.target.value }))} />
                <input className={inputClass} type="password" placeholder="Password" value={loginForm.password} onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))} />
                {loginErr && <div className="text-red text-sm">{loginErr}</div>}
                <button className={primaryBtn} disabled={loginLoading}>{loginLoading ? 'Memproses…' : 'Masuk →'}</button>
                <button type="button" className={linkBtn} onClick={() => setTab('lupa')}>Lupa password?</button>
              </form>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-navy/20" />
                <span className="font-mono text-[11px] uppercase tracking-[.06em] text-muted">atau</span>
                <div className="flex-1 h-px bg-navy/20" />
              </div>
              {googleErr && <div className="text-red text-sm mb-2 text-center">{googleErr}</div>}
              {googleLoading && <div className="text-muted text-sm mb-2 text-center">Memproses…</div>}
              <GoogleLoginButton onCredential={handleGoogleCredential} onError={setGoogleErr} />
            </>
          )}

          {tab === 'daftar' && (
            <form onSubmit={submitRegister} className="flex flex-col gap-3.5">
              <div className="font-serif font-semibold text-[22px] text-navy">Buat akun baru.</div>
              <div className="grid grid-cols-2 gap-2.5">
                <input className={inputClass} placeholder="Nama depan" value={regForm.firstName} onChange={(e) => setRegForm((f) => ({ ...f, firstName: e.target.value }))} />
                <input className={inputClass} placeholder="Nama belakang" value={regForm.lastName} onChange={(e) => setRegForm((f) => ({ ...f, lastName: e.target.value }))} />
              </div>
              <input className={inputClass} placeholder="Email kampus (@student…)" value={regForm.email} onChange={(e) => setRegForm((f) => ({ ...f, email: e.target.value }))} />
              <input className={inputClass} placeholder="Username" value={regForm.username} onChange={(e) => setRegForm((f) => ({ ...f, username: e.target.value }))} />
              <input className={inputClass} type="password" placeholder="Password (min. 8 karakter)" value={regForm.password} onChange={(e) => setRegForm((f) => ({ ...f, password: e.target.value }))} />
              <input className={inputClass} type="password" placeholder="Ulangi password" value={regForm.confirmPassword} onChange={(e) => setRegForm((f) => ({ ...f, confirmPassword: e.target.value }))} />
              <div className="flex gap-4 font-sans text-sm text-navy">
                <label className="flex items-center gap-1.5">
                  <input type="radio" name="gender" checked={regForm.gender === 'male'} onChange={() => setRegForm((f) => ({ ...f, gender: 'male' }))} /> Laki-laki
                </label>
                <label className="flex items-center gap-1.5">
                  <input type="radio" name="gender" checked={regForm.gender === 'female'} onChange={() => setRegForm((f) => ({ ...f, gender: 'female' }))} /> Perempuan
                </label>
              </div>
              {regErr && <div className="text-red text-sm">{regErr}</div>}
              <button className={primaryBtn} disabled={regLoading}>{regLoading ? 'Mendaftar…' : 'Daftar →'}</button>
              <div className="text-xs text-muted text-center">Dengan mendaftar kamu menyetujui aturan mading kampus.</div>
            </form>
          )}

          {tab === 'daftar' && (
            <>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-navy/20" />
                <span className="font-mono text-[11px] uppercase tracking-[.06em] text-muted">atau daftar cepat</span>
                <div className="flex-1 h-px bg-navy/20" />
              </div>
              {googleErr && <div className="text-red text-sm mb-2 text-center">{googleErr}</div>}
              {googleLoading && <div className="text-muted text-sm mb-2 text-center">Memproses…</div>}
              <GoogleLoginButton onCredential={handleGoogleCredential} onError={setGoogleErr} text="signup_with" />
            </>
          )}

          {tab === 'verifikasi' && (
            <form onSubmit={submitVerify} className="flex flex-col gap-3.5 text-center">
              <div className="text-[34px]">✉️</div>
              <div className="font-serif font-semibold text-[22px] text-navy">Cek email kampusmu.</div>
              <p className="m-0 text-sm text-muted">
                Kami mengirim tautan verifikasi ke <b>{regForm.email || 'emailmu'}</b>. Klik tautan itu untuk mengaktifkan akun, atau tempel token dari email di bawah.
              </p>
              <input className={inputClass} placeholder="Token verifikasi (dari email)" value={verifyToken} onChange={(e) => setVerifyToken(e.target.value)} />
              {verifyErr && <div className="text-red text-sm">{verifyErr}</div>}
              {verifyMsg && <div className="text-green text-sm">{verifyMsg}</div>}
              <button className={primaryBtn} disabled={verifyLoading}>{verifyLoading ? 'Memproses…' : 'Verifikasi'}</button>
              <button type="button" className={linkBtn} onClick={resendVerify} disabled={resendCooldown > 0}>
                {resendCooldown > 0 ? `Kirim ulang kode (0:${String(resendCooldown).padStart(2, '0')})` : 'Kirim ulang email verifikasi'}
              </button>
            </form>
          )}

          {tab === 'lupa' && lupaStep === 'email' && (
            <form onSubmit={submitLupaEmail} className="flex flex-col gap-3.5">
              <div className="font-serif font-semibold text-[22px] text-navy">Atur ulang password.</div>
              <p className="m-0 text-sm text-muted">Masukkan email kampusmu. Kami akan mengirim kode 6 digit untuk membuat password baru.</p>
              <input className={inputClass} placeholder="Email kampus" value={lupaEmail} onChange={(e) => setLupaEmail(e.target.value)} />
              {lupaErr && <div className="text-red text-sm">{lupaErr}</div>}
              <button className={primaryBtn} disabled={lupaLoading}>{lupaLoading ? 'Mengirim…' : 'Kirim Kode Reset'}</button>
              <button type="button" className={linkBtn} onClick={() => setTab('masuk')}>← Kembali ke Masuk</button>
            </form>
          )}

          {tab === 'lupa' && lupaStep === 'code' && (
            <form onSubmit={submitLupaCode} className="flex flex-col gap-3.5">
              <div className="font-serif font-semibold text-[22px] text-navy">Masukkan kode.</div>
              <p className="m-0 text-sm text-muted">Kode 6 digit telah dikirim ke <b>{lupaEmail}</b>.</p>
              <input className={inputClass + ' font-mono text-center tracking-[.3em]'} maxLength={6} placeholder="000000" value={lupaCode} onChange={(e) => setLupaCode(e.target.value.replace(/\D/g, ''))} />
              {lupaErr && <div className="text-red text-sm">{lupaErr}</div>}
              <button className={primaryBtn} disabled={lupaLoading || lupaCode.length !== 6}>{lupaLoading ? 'Memeriksa…' : 'Verifikasi Kode'}</button>
              <button type="button" className={linkBtn} onClick={() => setLupaStep('email')}>← Ganti email</button>
            </form>
          )}

          {tab === 'lupa' && lupaStep === 'reset' && (
            <form onSubmit={submitLupaReset} className="flex flex-col gap-3.5">
              <div className="font-serif font-semibold text-[22px] text-navy">Buat password baru.</div>
              <input className={inputClass} type="password" placeholder="Password baru (min. 8 karakter)" value={lupaPw.password} onChange={(e) => setLupaPw((f) => ({ ...f, password: e.target.value }))} />
              <input className={inputClass} type="password" placeholder="Ulangi password baru" value={lupaPw.confirmPassword} onChange={(e) => setLupaPw((f) => ({ ...f, confirmPassword: e.target.value }))} />
              {lupaErr && <div className="text-red text-sm">{lupaErr}</div>}
              {lupaMsg && <div className="text-green text-sm">{lupaMsg}</div>}
              <button className={primaryBtn} disabled={lupaLoading}>{lupaLoading ? 'Menyimpan…' : 'Simpan Password Baru'}</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
