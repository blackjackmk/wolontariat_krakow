import { useEffect, useState } from 'react';
import { getOffers } from '@/api/offers';

export default function VolunteerOffersPage() {
  const [offers, setOffers] = useState<Oferta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOffers().then(data => {
      setOffers(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Ładowanie ofert…</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Oferty dla wolontariuszy</h1>
      <ul className="space-y-3">
        {offers.map(oferta => (
          <li key={oferta.id} className="rounded border bg-white p-4">
            <div className="font-medium">{oferta.tytul_oferty}</div>
            <div className="text-sm text-gray-600">
              Organizacja: {oferta.organizacja.nazwa_organizacji} • Projekt: {oferta.projekt.nazwa_projektu}
            </div>
            <div className="text-sm mt-1">
              Status: {oferta.czy_ukonczone ? 'Ukończone' : 'Otwarte'}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

