import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Pencil, ArrowLeft } from 'lucide-react';
import { getOfferById } from '@/api/offers';
import { Card } from '@/components/ui/card';

export default function OrganizationOffersShowPage() {
  const params = useParams();
  const id = Number(params.id);
  const [offer, setOffer] = useState<Oferta | null>(null);

  useEffect(() => {
    getOfferById(id).then(o => setOffer(o || null));
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
          {offer.tematyka && <span className="rounded bg-blue-100 text-blue-800 px-2 py-0.5">{offer.tematyka}</span>}
          {offer.czas_trwania && <span className="rounded bg-purple-100 text-purple-800 px-2 py-0.5">{offer.czas_trwania}</span>}
          {offer.czy_ukonczone && <span className="rounded bg-green-100 text-green-800 px-2 py-0.5">Zakończona</span>}
        </div>
        {offer.wymagania && (
          <div className="text-sm text-gray-700 mt-2">Wymagania: {offer.wymagania}</div>
        )}
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
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map(v => {
                  const canReview = Boolean(offer.czy_ukonczone && offer.wolontariusz && offer.wolontariusz.id === v.id);
                  return (
                  <tr key={v.id} className="border-t">
                    <td className="py-2 pr-4">
                      <Link className="text-blue-600 hover:underline" to={`/organization/volunteers/${v.id}`}>{v.username}</Link>
                    </td>
                    <td className="py-2 pr-4">{v.email}</td>
                    <td className="py-2 pr-4">{v.nr_telefonu}</td>
                    <td className="py-2 pr-4">
                      <span className={`inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded border ${v.czy_maloletni ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 'bg-emerald-50 border-emerald-300 text-emerald-700'}`}>
                        {v.czy_maloletni ? 'Małoletni' : 'Pełnoletni'}{typeof v.wiek === 'number' ? ` (${v.wiek} lat)` : ''}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      {canReview ? (
                        <button
                          className="text-blue-600 hover:underline"
                          onClick={async () => {
                            const ratingStr = window.prompt('Ocena (1-5):');
                            if (!ratingStr) return;
                            const ocena = Number(ratingStr);
                            if (!Number.isInteger(ocena) || ocena < 1 || ocena > 5) {
                              window.alert('Podaj liczbę od 1 do 5');
                              return;
                            }
                            const komentarz = window.prompt('Komentarz (opcjonalny):') || '';
                            try {
                              const { createReview } = await import('@/api/reviews');
                              await createReview({ oferta: offer.id, ocena, komentarz, wolontariusz: v.id });
                              window.alert('Dziękujemy! Recenzja została dodana.');
                            } catch (e) {
                              window.alert('Nie udało się dodać recenzji.');
                            }
                          }}
                        >
                          Oceń
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">Brak</span>
                      )}
                    </td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
