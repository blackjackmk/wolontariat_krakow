import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Pencil, ArrowLeft } from 'lucide-react';
import { getOffers } from '@/api/offers';
import { Card } from '@/components/ui/card';

export default function OrganizationOffersShowPage() {
  const params = useParams();
  const id = Number(params.id);
  const [offer, setOffer] = useState<Oferta | null>(null);

  useEffect(() => {
    getOffers().then(all => setOffer(all.find(o => o.id === id) || null));
  }, [id]);

  const volunteers = useMemo(() => {
    if (!offer) return [];
    if (Array.isArray(offer.wolontariusze) && offer.wolontariusze.length > 0) return offer.wolontariusze;
    return offer.wolontariusz ? [offer.wolontariusz] : [];
  }, [offer]);

  if (!offer) return <div>Nie znaleziono oferty</div>;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{offer.tytul_oferty}</h1>
            <div className="text-sm text-gray-700">Projekt: <b>{offer.projekt.nazwa_projektu}</b></div>
            <div className="text-sm text-gray-700">Organizacja: <b>{offer.organizacja.nazwa_organizacji}</b></div>
            <div className="text-sm text-gray-700">Status: {offer.czy_ukonczone ? 'Ukończone' : 'Otwarte'}</div>
            <div className="text-xs text-gray-600 mt-1">Uczestnicy: {offer.liczba_uczestnikow ?? (offer.wolontariusz ? 1 : 0)}</div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button asChild>
              <Link to={`/organization/offers/${offer.id}/edit`}><Pencil /> Edytuj</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={`/organization/projects/${offer.projekt.id}`}><ArrowLeft /> Wróć</Link>
            </Button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {offer.lokalizacja && <span className="rounded bg-gray-100 px-2 py-0.5">{offer.lokalizacja}</span>}
          {offer.czy_ukonczone && <span className="rounded bg-green-100 text-green-800 px-2 py-0.5">Zakończona</span>}
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="font-semibold mb-3">Zgłoszeni wolontariusze</h2>
        {volunteers.length === 0 ? (
          <div className="text-sm text-gray-600">Brak zgłoszeń dla tej oferty.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs text-gray-600">
                <tr>
                  <th className="py-2 pr-4">Użytkownik</th>
                  <th className="py-2 pr-4">E-mail</th>
                  <th className="py-2 pr-4">Telefon</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map(v => (
                  <tr key={v.id} className="border-t">
                    <td className="py-2 pr-4">{v.username}</td>
                    <td className="py-2 pr-4">{v.email}</td>
                    <td className="py-2 pr-4">{v.nr_telefonu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
