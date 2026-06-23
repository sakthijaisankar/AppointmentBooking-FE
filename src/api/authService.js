import apiClient from './client';

const BASE = '/api/auth';

export async function login(credentials) {
  const { data } = await apiClient.post(`${BASE}/login`, credentials);
  return data;
}

export async function register(userData) {
  const { data } = await apiClient.post(`${BASE}/register`, userData);
  return data;
}

export async function logout() {
  const { data } = await apiClient.post(`${BASE}/logout`);
  return data;
}

export async function getProfile() {
  const { data } = await apiClient.get(`${BASE}/profile`);
  return data;
}

export async function updateProfile(profileData) {
  const { data } = await apiClient.put(`${BASE}/profile`, profileData);
  return data;
}

export async function changePassword(passwordData) {
  const { data } = await apiClient.post(`${BASE}/change-password`, passwordData);
  return data;
}

export async function forgotPassword(email) {
  const { data } = await apiClient.post(`${BASE}/forgot-password`, { email });
  return data;
}

export async function resetPassword(resetData) {
  const { data } = await apiClient.post(`${BASE}/reset-password`, resetData);
  return data;
}

export async function getRoles() {
  const { data } = await apiClient.get(`${BASE}/roles`);
  return data;
}

export function storeAuthSession(loginResponse) {
  sessionStorage.setItem('authToken', loginResponse.data.token);
  sessionStorage.setItem('authUser', JSON.stringify(loginResponse.data.user));
  sessionStorage.setItem('tokenExpiresAt', loginResponse.data.expiresAt);
}

export function clearAuthSession() {
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('authUser');
  sessionStorage.removeItem('tokenExpiresAt');
}

export function getStoredUser() {
  const raw = sessionStorage.getItem('authUser');
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated() {
  const token = sessionStorage.getItem('authToken');
  const expiresAt = sessionStorage.getItem('tokenExpiresAt');
  if (!token || !expiresAt) return false;
  return new Date(expiresAt) > new Date();
}

export function hasRole(role) {
  const user = getStoredUser();
  return user?.roles?.includes(role) ?? false;
}

export function hasAnyRole(roles) {
  return roles.some(hasRole);
}
