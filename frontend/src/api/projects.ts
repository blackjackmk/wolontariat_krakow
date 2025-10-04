// src/api/projects.ts
import { mockProjekty } from '@/mock-data/data';

export async function getProjects(): Promise<Projekt[]> {
  // TODO: replace with real API call, e.g. api.get('/projects/')
  return Promise.resolve(mockProjekty);
}

export async function getProjectById(id: number): Promise<Projekt | undefined> {
  // TODO: replace with real API call, e.g. api.get(`/projects/${id}/`)
  return Promise.resolve(mockProjekty.find(p => p.id === id));
}

