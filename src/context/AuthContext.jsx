import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService.js';
import { apiProfileService } from '../services/apiProfileService.js';
import { apiUserService } from '../services/apiUserService.js';
import { useToast } from './ToastContext.jsx';
import { disconnectSocket } from '../services/socketService.js';
import { clearMusicSession } from '../utils/musicSession.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    const storedUser = localStorage.getItem('auth_user');
    let storedUserToken = null;
    try {
      storedUserToken = storedUser ? JSON.parse(storedUser)?.token : null;
    } catch {
      storedUserToken = null;
    }
    return localStorage.getItem('mka_admin_logged_in') === 'true'
      && Boolean(localStorage.getItem('auth_token') || storedUserToken);
  });
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    async function fetchUserAndProfile() {
      try {
        const user = authService.getCurrentUser();
        if (user) {
          if (user.role === 'ADMIN') {
            const token = localStorage.getItem('auth_token') || user.token;
            if (!token) {
              authService.logout();
              localStorage.removeItem('mka_admin_logged_in');
              setCurrentUser(null);
              setIsAdminLoggedIn(false);
              return;
            }
            if (!localStorage.getItem('auth_token')) {
              localStorage.setItem('auth_token', token);
            }
            const adminUser = { ...user, username: user.username || '@admin', hasProfile: true };
            setCurrentUser(adminUser);
            setIsAdminLoggedIn(true);
            return;
          }

          const resolvedId = user.id || user.userId;

          try {
            const profileRes = await apiProfileService.getMyProfile();
            const profileUserId = profileRes?.data?.userId || profileRes?.data?.id;
            const finalUserId = resolvedId || profileUserId;

            if (profileRes && profileRes.success && profileRes.data?.username) {
              const dbUsername = profileRes.data.username.startsWith('@')
                ? profileRes.data.username
                : `@${profileRes.data.username}`;
              const updatedUser = {
                ...user,
                id: finalUserId,
                userId: finalUserId,
                username: dbUsername,
                fullName: profileRes.data.fullName || user.fullName,
                hasProfile: true,
              };
              localStorage.setItem('auth_user', JSON.stringify(updatedUser));
              if (finalUserId) {
                localStorage.setItem(`user_profile_${finalUserId}`, JSON.stringify(profileRes.data));
              }
              localStorage.setItem('user_profile', JSON.stringify(profileRes.data));
              setCurrentUser(updatedUser);
              return;
            }
          } catch (e) {
            // DB profile fetch error fallback
          }

          const defaultHandle = user.username
            ? (user.username.startsWith('@') ? user.username : `@${user.username}`)
            : `@user_${resolvedId || 'anonymous'}`;
          setCurrentUser({ ...user, id: resolvedId, userId: resolvedId, username: defaultHandle });
        } else {
          setCurrentUser(null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchUserAndProfile();
  }, []);

  const login = async (email, password, options) => {
    try {
      const result = await authService.login(email, password, options);
      const user = result.user || result;
      const resolvedId = user.id || user.userId;
      clearMusicSession(resolvedId);

      // Admins live in admin scope and have no user profile
      if (user.role === 'ADMIN') {
        const adminUser = { ...user, id: resolvedId, userId: resolvedId, username: user.username || '@admin', hasProfile: true };
        localStorage.setItem('auth_user', JSON.stringify(adminUser));
        localStorage.setItem('mka_admin_logged_in', 'true');
        setCurrentUser(adminUser);
        setIsAdminLoggedIn(true);
        addToast(`Welcome back Admin!`, 'success');
        return { ...result, user: adminUser };
      }

      // Try fetching database profile for regular users to resolve handle & language preference
      let dbHandle = null;
      let dbUserId = null;
      try {
        const profileRes = await apiProfileService.getMyProfile();
        if (profileRes && profileRes.data) {
          dbUserId = profileRes.data.userId || profileRes.data.id;
          if (profileRes.data.username) {
            dbHandle = profileRes.data.username.startsWith('@')
              ? profileRes.data.username
              : `@${profileRes.data.username}`;
          }
          const savedLang = profileRes.data.preferredLanguage || user.preferredLanguage || user.language;
          if (savedLang) {
            localStorage.setItem('mka_preferred_language', savedLang);
            window.dispatchEvent(new CustomEvent('mka_language_changed', { detail: savedLang }));
          }
        }
      } catch (e) {}

      const finalUserId = resolvedId || dbUserId;
      const cleanHandle = dbHandle || (user.username
        ? (user.username.startsWith('@') ? user.username : `@${user.username}`)
        : `@user_${finalUserId || 'anonymous'}`);

      const updatedUser = {
        ...user,
        id: finalUserId,
        userId: finalUserId,
        username: cleanHandle,
        hasProfile: true,
      };
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      addToast(`Welcome back, ${cleanHandle}!`, 'success');
      return { ...result, user: updatedUser };
    } catch (err) {
      addToast(err.message || 'Login failed', 'error');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const result = await authService.register(userData);
      addToast('Registration successful. Verify your email to continue.', 'success');
      return result;
    } catch (err) {
      addToast(err.message || 'Registration failed', 'error');
      throw err;
    }
  };

  const updateProfile = async (updates) => {
    if (!currentUser) return;
    let resData = null;
    if (apiProfileService && apiProfileService.updateProfile) {
      const res = await apiProfileService.updateProfile(updates);
      resData = res?.data || res;
    }
    const cleanUsername = updates.username
      ? (updates.username.startsWith('@') ? updates.username : `@${updates.username}`)
      : currentUser.username;
    const updated = { 
      ...currentUser, 
      ...updates, 
      fullName: resData?.fullName || updates.fullName || currentUser.fullName,
      username: cleanUsername, 
      hasProfile: true 
    };
    localStorage.setItem('auth_user', JSON.stringify(updated));
    if (currentUser.id) {
      localStorage.setItem(`user_profile_${currentUser.id}`, JSON.stringify(updated));
    }
    localStorage.setItem('user_profile', JSON.stringify(updated));
    setCurrentUser(updated);
    queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
    addToast('Profile updated successfully.', 'success');
    return updated;
  };

  const logout = () => {
    disconnectSocket();
    clearMusicSession(currentUser?.id);
    authService.logout();
    queryClient.removeQueries({ queryKey: ['users'] });
    queryClient.removeQueries({ queryKey: ['profile'] });
    setCurrentUser(null);
    setIsAdminLoggedIn(false);
    localStorage.removeItem('mka_admin_logged_in');
    addToast('You have logged out.', 'info');
  };

  const adminLogin = async (email, password) => {
    const result = await login(email, password, { allowMockFallback: false });
    if (result.user.role !== 'ADMIN') {
      logout();
      throw new Error('This account does not have administrator access.');
    }
    setIsAdminLoggedIn(true);
    localStorage.setItem('mka_admin_logged_in', 'true');
    return result;
  };

  const adminLogout = () => {
    disconnectSocket();
    clearMusicSession(currentUser?.id);
    authService.logout();
    setCurrentUser(null);
    setIsAdminLoggedIn(false);
    localStorage.removeItem('mka_admin_logged_in');
    addToast('Admin logged out.', 'info');
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAdminLoggedIn,
      loading,
      login,
      register,
      updateProfile,
      logout,
      adminLogin,
      adminLogout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
