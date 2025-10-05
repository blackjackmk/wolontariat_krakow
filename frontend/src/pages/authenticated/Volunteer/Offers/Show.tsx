import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOfferById, applyToOffer, withdrawApplication } from '@/api/offers';
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

  const alreadyApplied = Boolean(user && ((offer.wolontariusze || []).some(u => u.id === user.id) || (offer.wolontariusz && offer.wolontariusz.id === user.id)));
  const canApply = Boolean(user && !alreadyApplied && !offer.czy_ukonczone);
  const canWithdraw = Boolean(user && alreadyApplied && !offer.czy_ukonczone);

  const onApply = async () => {
    if (!user) return;
    const updated = await applyToOffer(offer.id, user);
    if (updated) setOffer({ ...offer, ...updated });
  };

  const onWithdraw = async () => {
    if (!user) return;
    const updated = await withdrawApplication(offer.id, user);
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
        {offer.tematyka && (
          <div className="text-sm text-gray-700">Tematyka: <b>{offer.tematyka}</b></div>
        )}
        <div className="text-sm text-gray-700">
          Status: {offer.czy_ukonczone ? 'Ukończone' : 'Otwarte'}
        </div>
        <div className="text-sm text-gray-700">
          Uczestnicy: {offer.liczba_uczestnikow ?? (offer.wolontariusz ? 1 : 0)}
        </div>
        {offer.wymagania && (
          <div className="text-sm text-gray-700">
            Wymagania: {offer.wymagania}
          </div>
        )}
        <div className="pt-2 flex gap-2">
          <Button onClick={onApply} disabled={!canApply}>
            {alreadyApplied ? 'Zgłoszono' : 'Aplikuj'}
          </Button>
          {canWithdraw && <Button variant="secondary" onClick={onWithdraw}>Wycofaj zgłoszenie</Button>}
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
