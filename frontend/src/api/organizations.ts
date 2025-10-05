import api from './axios';

export async function getOrganizations(): Promise<Organizacja[]> {
  const res = await api.get('organizations/');
  const items = Array.isArray(res.data) ? res.data : res.data?.results || [];
  return items as Organizacja[];
}

export async function getOrganizationById(id: number): Promise<Organizacja | undefined> {
  const res = await api.get(`organizations/${id}/`);
  return res.data as Organizacja;
}
