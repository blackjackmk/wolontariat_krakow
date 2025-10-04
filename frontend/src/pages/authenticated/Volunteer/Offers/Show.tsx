import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOfferById, applyToOffer } from '@/api/offers';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function VolunteerOfferShowPage() {
  const params = useParams();
  const id = Number(params.id);
  const [offer, setOffer] = useState<Oferta | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    getOfferById(id).then(o => setOffer(o || null));
  }, [id]);

  if (!offer) return <div>Nie znaleziono oferty</div>;

  const canApply = true; // placeholder rule

  const onApply = async () => {
    if (!user) return;
    const updated = await applyToOffer(offer.id, user);
    if (updated) setOffer({ ...offer, ...updated });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{offer.tytul_oferty}</h1>
        <Link className="text-blue-600 hover:underline" to="/volunteer/offers">Wróć do listy</Link>
      </div>

      <Card className="p-4 space-y-2">
        <div className="text-sm text-gray-700">
          Organizacja: <b>{offer.organizacja.nazwa_organizacji}</b>
        </div>
        <div className="text-sm text-gray-700">
          Projekt: <b>{offer.projekt.nazwa_projektu}</b>
        </div>
        {offer.lokalizacja && (
          <div className="text-sm text-gray-700">Lokalizacja: <b>{offer.lokalizacja}</b></div>
        )}
        {offer.czas_trwania && (
          <div className="text-sm text-gray-700">Czas trwania: <b>{offer.czas_trwania}</b></div>
        )}
        {offer.temat && (
          <div className="text-sm text-gray-700">Temat: <b>{offer.temat}</b></div>
        )}
        <div className="text-sm text-gray-700">
          Status: {offer.czy_ukonczone ? 'Ukończone' : 'Otwarte'}
        </div>
        <div className="text-sm text-gray-700">
          Uczestnicy: {offer.liczba_uczestnikow ?? (offer.wolontariusz ? 1 : 0)}
          {offer.limit_uczestnikow ? ` / ${offer.limit_uczestnikow}` : ''}
        </div>
        {offer.wymagania && offer.wymagania.length > 0 && (
          <div className="text-sm text-gray-700">
            Wymagania: {offer.wymagania.join(', ')}
          </div>
        )}
        <div className="pt-2">
          {canApply && (
            <Button onClick={onApply}>Aplikuj</Button>
          )}
        </div>
      </Card>

      {/* Expanded project info (placeholder) */}
      <Card className="p-4 space-y-2">
        <h2 className="font-semibold">Szczegóły projektu</h2>
        <div className="text-sm text-gray-700">{offer.projekt.opis_projektu}</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-sm">
          <div className="rounded bg-gray-50 p-3">
            <div className="text-xs text-gray-500">Koordynator</div>
            <div>— (placeholder)</div>
          </div>
          <div className="rounded bg-gray-50 p-3">
            <div className="text-xs text-gray-500">Uczestnicy</div>
            <div>{offer.liczba_uczestnikow ?? (offer.wolontariusz ? 1 : 0)}</div>
          </div>
          <div className="rounded bg-gray-50 p-3">
            <div className="text-xs text-gray-500">Najbliższa data</div>
            <div>— (placeholder)</div>
          </div>
          <div className="rounded bg-gray-50 p-3">
            <div className="text-xs text-gray-500">Kontakt</div>
            <div>{offer.organizacja.nr_telefonu}</div>
          </div>
        </div>
      </Card>
    </section>
  );
}

