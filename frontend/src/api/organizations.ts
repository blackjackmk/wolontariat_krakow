// src/api/organizations.ts
import { mockOrganizacje } from '@/mock-data/data';

export async function getOrganizations(): Promise<Organizacja[]> {
  // TODO: replace with real API call, e.g. api.get('/organizations/')
  return Promise.resolve(mockOrganizacje);
}

export async function getOrganizationById(id: number): Promise<Organizacja | undefined> {
  // TODO: replace with real API call, e.g. api.get(`/organizations/${id}/`)
  return Promise.resolve(mockOrganizacje.find(o => o.id === id));
}

