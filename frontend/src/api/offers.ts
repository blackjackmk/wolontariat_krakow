import api from './axios';
import { mapOfertaFromApi } from './mappers';

export async function getOffers(): Promise<Oferta[]> {
  const res = await api.get('offers/', { params: { completed: false } });
  const items = Array.isArray(res.data) ? res.data : res.data?.results || [];
  return items.map(mapOfertaFromApi);
}

export async function getOfferById(id: number): Promise<Oferta | undefined> {
  const res = await api.get(`offers/${id}/`);
  return mapOfertaFromApi(res.data);
}

export async function applyToOffer(offerId: number, user: Uzytkownik): Promise<Oferta | undefined> {
  try {
    const res = await api.post(`offers/${offerId}/apply/`);
    return mapOfertaFromApi(res.data);
  } catch {
    // Graceful fallback (no-auth dev): fetch and attach mock user locally
    const fresh = await getOfferById(offerId);
    if (!fresh) return undefined;
    if (!fresh.wolontariusz) {
      fresh.wolontariusz = user;
    }
    return fresh;
  }
}

export async function withdrawApplication(offerId: number, user: Uzytkownik): Promise<Oferta | undefined> {
  try {
    const res = await api.post(`offers/${offerId}/withdraw/`);
    return mapOfertaFromApi(res.data);
  } catch {
    // Optimistic fallback
    const fresh = await getOfferById(offerId);
    if (!fresh) return undefined;
    if (fresh.wolontariusz && fresh.wolontariusz.id === user.id) {
      fresh.wolontariusz = null;
      fresh.czy_ukonczone = false;
    }
    return fresh;
  }
}

export async function assignVolunteer(offerId: number, volunteerId: number): Promise<Oferta | undefined> {
  try {
    const res = await api.post(`offers/${offerId}/assign/`, { wolontariusz_id: volunteerId });
    return mapOfertaFromApi(res.data);
  } catch {
    // Optimistic fallback
    const fresh = await getOfferById(offerId);
    if (!fresh) return undefined;
    fresh.wolontariusz = { id: volunteerId, username: '', email: '', nr_telefonu: '', organizacja: null, rola: 'wolontariusz' } as Uzytkownik;
    return fresh;
  }
}

export async function createOffer(data: { projekt: number; tytul_oferty: string; lokalizacja: string }): Promise<Oferta> {
  const res = await api.post('offers/', data);
  return mapOfertaFromApi(res.data);
}

export async function updateOffer(
  id: number,
  data: Partial<{ projekt: number; tytul_oferty: string; lokalizacja: string; wolontariusz: number | null; czy_ukonczone: boolean }>
): Promise<Oferta> {
  const res = await api.patch(`offers/${id}/`, data);
  return mapOfertaFromApi(res.data);
}

export async function deleteOffer(id: number): Promise<void> {
  await api.delete(`offers/${id}/`);
}
