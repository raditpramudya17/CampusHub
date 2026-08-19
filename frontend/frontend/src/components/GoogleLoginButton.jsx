import React, { useCallback, useEffect, useRef } from 'react';

const GIS_SRC = 'https://accounts.google.com/gsi/client';

let scriptPromise = null;
function loadGoogleScript() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) { resolve(); return; }
    const script = document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Gagal memuat skrip Google'));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

// Merender tombol "Sign in with Google" resmi dari Google Identity Services.
// Saat user memilih akun, Google memanggil callback dengan sebuah ID token (JWT)
// yang lalu dikirim ke backend (POST /api/auth/google) untuk diverifikasi.
export default function GoogleLoginButton({ onCredential, onError, text = 'continue_with' }) {
  const buttonRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleCredential = useCallback((response) => {
    if (response?.credential) onCredential(response.credential);
    else onError?.('Tidak menerima token dari Google');
  }, [onCredential, onError]);

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !window.google?.accounts?.id || !buttonRef.current) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredential,
        });
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 360,
          text,
        });
      })
      .catch((err) => onError?.(err.message));

    return () => { cancelled = true; };
  }, [clientId, handleCredential, onError, text]);

  if (!clientId) {
    // Belum dikonfigurasi (VITE_GOOGLE_CLIENT_ID kosong) — sembunyikan tombol daripada menampilkan tombol rusak
    return null;
  }

  return <div ref={buttonRef} className="flex justify-center" />;
}
