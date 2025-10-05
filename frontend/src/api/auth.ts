import api from './axios';

type LoginResponse = {
  user: Uzytkownik;
  token: string;
};

export async function loginApi(username: string, password: string): Promise<Uzytkownik> {
  const res = await api.post<LoginResponse>('auth/login/', { username, password });
  const { user, token } = res.data as LoginResponse;
  localStorage.setItem('token', token);
  return user;
}

type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  nr_telefonu: string;
  rola: RoleType;
  first_name?: string;
  last_name?: string;
  // Note: backend supports organizacja_id optionally, but UI does not collect it yet
  organizacja_id?: number;
};

export async function registerApi(payload: RegisterPayload): Promise<Uzytkownik> {
  const res = await api.post<LoginResponse>('auth/register/', payload);
  const { user, token } = res.data as LoginResponse;
  localStorage.setItem('token', token);
  return user;
}

export async function logoutApi(): Promise<void> {
  try {
    await api.post('auth/logout/');
  } finally {
    localStorage.removeItem('token');
  }
}

