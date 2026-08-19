import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AuthService } from '../services/authService';
import { UserService } from '../services/userService';
import { BookmarkService } from '../services/bookmarkService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, firstName, lastName, email, username, gender, role, isVerified }
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState(new Set());

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await UserService.getMe();
      setUser(me);
    } catch (err) {
      // token invalid/expired and no refresh recovery here — clear session
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const loadSaved = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setSavedIds(new Set());
      return;
    }
    try {
      const saved = await BookmarkService.getMine();
      setSavedIds(new Set(saved.map((c) => c.id)));
    } catch (e) {
      // non-critical — leave savedIds as-is
    }
  }, []);

  useEffect(() => {
    if (user) loadSaved();
    else setSavedIds(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const toggleSave = useCallback(async (competitionId) => {
    const wasSaved = savedIds.has(competitionId);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (wasSaved) next.delete(competitionId);
      else next.add(competitionId);
      return next;
    });
    try {
      if (wasSaved) await BookmarkService.remove(competitionId);
      else await BookmarkService.save(competitionId);
    } catch (e) {
      // rollback optimistic update on failure
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.add(competitionId);
        else next.delete(competitionId);
        return next;
      });
      throw e;
    }
  }, [savedIds]);

  const login = useCallback(async (username, password) => {
    const data = await AuthService.login(username, password);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    await loadUser();
    return data;
  }, [loadUser]);

  const loginWithGoogle = useCallback(async (idToken) => {
    const data = await AuthService.googleLogin(idToken);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    await loadUser();
    return data;
  }, [loadUser]);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) await AuthService.logout(refreshToken);
    } catch (e) {
      // ignore — clear local session regardless
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setSavedIds(new Set());
  }, []);

  const role = user ? user.role : 'tamu';
  const value = {
    user,
    role,
    loading,
    isLoggedIn: !!user,
    isGuest: !user,
    isAdmin: role === 'admin',
    login,
    loginWithGoogle,
    logout,
    refreshUser: loadUser,
    savedIds,
    toggleSave,
    refreshSaved: loadSaved,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
