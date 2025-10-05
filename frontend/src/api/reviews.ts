import api from './axios';

export async function getReviewsByVolunteer(volunteerId: number): Promise<Recenzja[]> {
  const res = await api.get('reviews/', { params: { wolontariusz: volunteerId } });
  const items = Array.isArray(res.data) ? res.data : res.data?.results || [];
  return items as Recenzja[];
}

export async function createReview(payload: { oferta: number; ocena: number; komentarz?: string; wolontariusz?: number }): Promise<Recenzja> {
  const res = await api.post('reviews/', payload);
  return res.data as Recenzja;
}
