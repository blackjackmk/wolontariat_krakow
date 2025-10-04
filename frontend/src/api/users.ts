// src/api/users.ts
// Temporary mock-backed API with TODOs for real endpoints
import api from './axios';
import { mockUzytkownicy } from '@/mock-data/data';

export async function getUsers(): Promise<Uzytkownik[]> {
  // TODO: replace with: return (await api.get('/users/')).data;
  return Promise.resolve(mockUzytkownicy);
}

export async function getUserById(id: number): Promise<Uzytkownik | undefined> {
  // TODO: replace with: return (await api.get(`/users/${id}/`)).data;
  return Promise.resolve(mockUzytkownicy.find(u => u.id === id));
}

export async function findUserByUsername(username: string): Promise<Uzytkownik | undefined> {
  // TODO: replace with a server-side lookup
  return Promise.resolve(mockUzytkownicy.find(u => u.username === username));
}

export async function getCurrentProfile(): Promise<Uzytkownik | null> {
  // TODO: replace with: return (await api.get('/profile/')).data;
  try {
    await api.get('/__noop__'); // noop to ensure typings; remove when wiring
  } catch {}
  return Promise.resolve(null);
}

