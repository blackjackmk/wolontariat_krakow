import api from './axios';
import { mapProjektFromApi } from './mappers';

export async function getProjects(): Promise<Projekt[]> {
  const res = await api.get('projects/');
  const items = Array.isArray(res.data) ? res.data : res.data?.results || [];
  return items.map(mapProjektFromApi);
}

export async function getProjectById(id: number): Promise<Projekt | undefined> {
  const res = await api.get(`projects/${id}/`);
  return mapProjektFromApi(res.data);
}

export async function createProject(data: { nazwa_projektu: string; opis_projektu: string }): Promise<Projekt> {
  const res = await api.post('projects/', data);
  return mapProjektFromApi(res.data);
}

export async function updateProject(id: number, data: Partial<{ nazwa_projektu: string; opis_projektu: string; organizacja: number }>): Promise<Projekt> {
  const res = await api.patch(`projects/${id}/`, data);
  return mapProjektFromApi(res.data);
}

export async function deleteProject(id: number): Promise<void> {
  await api.delete(`projects/${id}/`);
}
