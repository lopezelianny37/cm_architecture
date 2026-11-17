import { apiClient, setToken, clearToken } from './apiClient';

interface AuthResponse {
  user: { id: string; email?: string };
  session: { access_token?: string; token_type?: string };
}

export async function login(email: string, password: string): Promise<void> {
  const result = await apiClient.post<AuthResponse>('/auth/login', { email, password });
  if (!result.session.access_token) {
    throw new Error('No se recibió token de sesión');
  }
  setToken(result.session.access_token);
}

export async function signup(email: string, password: string): Promise<void> {
  const result = await apiClient.post<AuthResponse>('/auth/signup', { email, password });
  if (result.session.access_token) {
    setToken(result.session.access_token);
  }
}

export function logout(): void {
  clearToken();
}
