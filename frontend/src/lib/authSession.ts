import { apiClient, setToken, setRefreshToken, clearToken } from './apiClient';

interface AuthResponse {
  user: { id: string; email?: string };
  session: { access_token?: string; refresh_token?: string; token_type?: string };
}

function storeSession(session: AuthResponse['session']): void {
  if (session.access_token) {
    setToken(session.access_token);
  }
  if (session.refresh_token) {
    setRefreshToken(session.refresh_token);
  }
}

export async function login(email: string, password: string): Promise<void> {
  const result = await apiClient.post<AuthResponse>('/auth/login', { email, password });
  if (!result.session.access_token) {
    throw new Error('No se recibió token de sesión');
  }
  storeSession(result.session);
}

export async function signup(email: string, password: string): Promise<void> {
  const result = await apiClient.post<AuthResponse>('/auth/signup', { email, password });
  storeSession(result.session);
}

export function logout(): void {
  clearToken();
}
