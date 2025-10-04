// src/api/offers.ts
import { mockOferty } from '@/mock-data/data';

export async function getOffers(): Promise<Oferta[]> {
  // TODO: replace with real API call, e.g. api.get('/offers/')
  return Promise.resolve(mockOferty);
}

export async function getOfferById(id: number): Promise<Oferta | undefined> {
  // TODO: replace with real API call, e.g. api.get(`/offers/${id}/`)
  return Promise.resolve(mockOferty.find(o => o.id === id));
}

