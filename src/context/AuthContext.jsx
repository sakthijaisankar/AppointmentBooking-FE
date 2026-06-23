import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
  getProfile as getProfileApi,
  updateProfile as updateProfileApi,
  changePassword as changePasswordApi,
  storeAuthSession,
  clearAuthSession,
  getStoredUser,
  isAuthenticated as checkAuth,
} from '../api/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [isAuthenticated, setIsAuthenticated] = useState(checkAuth);

  const login = useCallback(async (credentials) => {
    const response = await loginApi(credentials);
    storeAuthSession(response);
    setUser(response.data.user);
    setIsAuthenticated(true);
    return response;
  }, []);

  const register = useCallback(async (userData) => {
    const response = await registerApi(userData);
    storeAuthSession(response);
    setUser(response.data.user);
    setIsAuthenticated(true);
    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (checkAuth()) await logoutApi();
    } finally {
      clearAuthSession();
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const response = await getProfileApi();
    setUser(response.data);
    sessionStorage.setItem('authUser', JSON.stringify(response.data));
    return response;
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    const response = await updateProfileApi(profileData);
    setUser(response.data);
    sessionStorage.setItem('authUser', JSON.stringify(response.data));
    return response;
  }, []);

  const changePassword = useCallback(async (passwordData) => {
    return changePasswordApi(passwordData);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      login,
      register,
      logout,
      refreshProfile,
      updateProfile,
      changePassword,
      hasRole: (role) => user?.roles?.includes(role) ?? false,
      hasAnyRole: (roles) => roles.some((r) => user?.roles?.includes(r)),
    }),
    [user, isAuthenticated, login, register, logout, refreshProfile, updateProfile, changePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
