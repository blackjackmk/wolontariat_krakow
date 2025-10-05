import { mockWiadomosci } from '@/mock-data/data';

export async function getMessages(): Promise<Wiadomosc[]> {
  // TODO: replace with real API call, e.g. api.get('/messages/')
  return Promise.resolve(mockWiadomosci);
}

export async function getMessageById(id: number): Promise<Wiadomosc | undefined> {
  // TODO: replace with real API call, e.g. api.get(`/messages/${id}/`)
  return Promise.resolve(mockWiadomosci.find(m => m.id === id));
}
