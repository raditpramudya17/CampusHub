import React, { useEffect, useRef, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ChatWidget from './components/layout/ChatWidget';
import PapanPage from './pages/PapanPage';
import SemuaLombaPage from './pages/SemuaLombaPage';
import KalenderPage from './pages/KalenderPage';
import FamePage from './pages/FamePage';
import UnggahPage from './pages/UnggahPage';
import KirimanPage from './pages/KirimanPage';
import AdminPage from './pages/AdminPage';
import ProfilPage from './pages/ProfilPage';
import AuthPage from './pages/AuthPage';
import TersimpanPage from './pages/TersimpanPage';
import CariTimPage from './pages/CariTimPage';

const ROUTES = {
  '#/': PapanPage,
  '#/papan': PapanPage,
  '#/lomba': SemuaLombaPage,
  '#/kalender': KalenderPage,
  '#/fame': FamePage,
  '#/unggah': UnggahPage,
  '#/kiriman': KirimanPage,
  '#/tersimpan': TersimpanPage,
  '#/cari-tim': CariTimPage,
  '#/admin': AdminPage,
  '#/profil': ProfilPage,
  '#/auth': AuthPage,
};

function AppShell() {
  const [hash, setHash] = useState(window.location.hash || '#/papan');
  const chatRef = useRef(null);

  useEffect(() => {
    const onHashChange = () => {
      setHash(window.location.hash || '#/papan');
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const Page = ROUTES[hash] || PapanPage;

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header />
      <Page />
      <Footer onToggleChat={() => chatRef.current?.toggle()} />
      <ChatWidget ref={chatRef} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
