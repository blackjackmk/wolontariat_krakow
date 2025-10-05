// Temporary mock-backed API with TODOs for real endpoints
import api from './axios';
import { mockUzytkownicy } from '@/mock-data/data';

export async function getUsers(): Promise<Uzytkownik[]> {
  try {
    // Try privileged listing for orgs/coordinators
    const res = await api.get('volunteers/volunteers/');
    const items = Array.isArray(res.data) ? res.data : res.data?.results || [];
    return items as Uzytkownik[];
  } catch {
    // Fallback to mock data in no-auth dev
    return Promise.resolve(mockUzytkownicy);
  }
}

export async function getUserById(id: number): Promise<Uzytkownik | undefined> {
  try {
    const res = await api.get(`volunteers/${id}/`);
    return res.data as Uzytkownik;
  } catch {
    return Promise.resolve(mockUzytkownicy.find(u => u.id === id));
  }
}

export async function findUserByUsername(username: string): Promise<Uzytkownik | undefined> {
  // TODO: replace with a server-side lookup
  return Promise.resolve(mockUzytkownicy.find(u => u.username === username));
}

export async function getCurrentProfile(): Promise<Uzytkownik | null> {
  try {
    const res = await api.get('volunteers/me/');
    return res.data as Uzytkownik;
  } catch {
    return null;
  }
}
