// src/api/offers.ts
import { mockOferty, mockUzytkownicy } from '@/mock-data/data';

export async function getOffers(): Promise<Oferta[]> {
  // TODO: replace with real API call, e.g. api.get('/offers/')
  return Promise.resolve(mockOferty);
}

export async function getOfferById(id: number): Promise<Oferta | undefined> {
  // TODO: replace with real API call, e.g. api.get(`/offers/${id}/`)
  return Promise.resolve(mockOferty.find(o => o.id === id));
}

export async function applyToOffer(offerId: number, user: Uzytkownik): Promise<Oferta | undefined> {
  // Placeholder logic: assign current user as wolontariusz if slot is available
  const offer = mockOferty.find(o => o.id === offerId);
  if (!offer) return undefined;
  // if already taken and limit is 1, we block; otherwise simulate participant increment
  if (offer.limit_uczestnikow && offer.liczba_uczestnikow !== undefined) {
    if (offer.liczba_uczestnikow < offer.limit_uczestnikow) {
      offer.liczba_uczestnikow += 1;
    }
  } else {
    // Fallback to single-assignee model
    if (!offer.wolontariusz) {
      // prefer a user from mocks if exists to keep referential integrity
      const refUser = mockUzytkownicy.find(u => u.id === user.id) || user;
      offer.wolontariusz = refUser;
    }
  }
  return Promise.resolve(offer);
}

export async function withdrawApplication(offerId: number, user: Uzytkownik): Promise<Oferta | undefined> {
  const offer = mockOferty.find(o => o.id === offerId);
  if (!offer) return undefined;
  if (offer.limit_uczestnikow && offer.liczba_uczestnikow !== undefined) {
    if (offer.liczba_uczestnikow > 0) offer.liczba_uczestnikow -= 1;
  } else if (offer.wolontariusz && offer.wolontariusz.id === user.id) {
    offer.wolontariusz = null;
  }
  return Promise.resolve(offer);
}

export async function assignVolunteer(offerId: number, volunteerId: number): Promise<Oferta | undefined> {
  const offer = mockOferty.find(o => o.id === offerId);
  if (!offer) return undefined;
  const user = mockUzytkownicy.find(u => u.id === volunteerId);
  if (!user) return offer;

  if (offer.limit_uczestnikow && offer.liczba_uczestnikow !== undefined) {
    if (offer.liczba_uczestnikow < offer.limit_uczestnikow) {
      offer.liczba_uczestnikow += 1;
    }
  } else {
    // single-assignee model
    offer.wolontariusz = user;
  }
  return Promise.resolve(offer);
}
