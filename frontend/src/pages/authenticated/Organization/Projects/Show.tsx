import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Pencil, ArrowLeft, Eye, Plus } from 'lucide-react';
import { getProjects } from '@/api/projects';
import { getAllOffers } from '@/api/offers';
import { Card } from '@/components/ui/card';

export default function OrganizationProjectsShowPage() {
  const params = useParams();
  const id = Number(params.id);
  const [project, setProject] = useState<Projekt | null>(null);
  const [offers, setOffers] = useState<Oferta[]>([]);

  useEffect(() => {
    getProjects().then(all => setProject(all.find(p => p.id === id) || null));
    getAllOffers().then(setOffers);
  }, [id]);

  if (!project) return <div>Nie znaleziono projektu</div>;

  const relatedOffers = offers.filter(o => o.projekt.id === project.id);
  const appliedVolunteers = relatedOffers.flatMap(o => (Array.isArray(o.wolontariusze) && o.wolontariusze.length > 0) ? o.wolontariusze.map(v => ({...v, __offer: o})) : (o.wolontariusz ? [{...o.wolontariusz, __offer: o}] : []));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold mb-2">{project.nazwa_projektu}</h1>
        <div className="mb-4 text-gray-700">{project.opis_projektu}</div>
        <div className="text-sm">Organizacja: {project.organizacja.nazwa_organizacji}</div>
        <div className="mt-4 flex gap-2">
          <Button asChild>
            <Link to={`/organization/projects/${project.id}/edit`}><Pencil /> Edytuj</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={`/organization/offers/create?project=${project.id}`}><Plus /> Dodaj ofertę</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={`/organization/projects`}><ArrowLeft /> Wróć</Link>
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <h2 className="font-semibold mb-2">Oferty w projekcie</h2>
        {relatedOffers.length === 0 ? (
          <div className="text-sm text-gray-600">Brak ofert powiązanych z tym projektem.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {relatedOffers.map(o => (
              <Card key={o.id} className="p-3">
                <div className="font-medium text-sm">{o.tytul_oferty}</div>
                <div className="text-xs text-gray-600">
                  Uczestnicy: {o.liczba_uczestnikow ?? (o.wolontariusz ? 1 : 0)}
                </div>
                <div className="text-xs text-gray-600">Status: {o.czy_ukonczone ? 'Ukończone' : 'Otwarte'}</div>
                <Button asChild size="sm" variant="outline" className="mt-2">
                  <Link to={`/organization/offers/${o.id}`}><Eye /> Szczegóły</Link>
                </Button>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h2 className="font-semibold mb-2">Statystyki projektu</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="rounded bg-gray-50 p-3">
            <div className="text-xs text-gray-500">Liczba ofert</div>
            <div>{relatedOffers.length}</div>
          </div>
          <div className="rounded bg-gray-50 p-3">
            <div className="text-xs text-gray-500">Uczestnicy łącznie</div>
            <div>{relatedOffers.reduce((acc, o) => acc + (o.liczba_uczestnikow ?? (o.wolontariusz ? 1 : 0)), 0)}</div>
          </div>
          <div className="rounded bg-gray-50 p-3">
            <div className="text-xs text-gray-500">Otwarte oferty</div>
            <div>{relatedOffers.filter(o => !o.czy_ukonczone).length}</div>
          </div>
          <div className="rounded bg-gray-50 p-3">
            <div className="text-xs text-gray-500">Zamknięte</div>
            <div>{relatedOffers.filter(o => o.czy_ukonczone).length}</div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="font-semibold mb-2">Zgłoszeni wolontariusze</h2>
        {appliedVolunteers.length === 0 ? (
          <div className="text-sm text-gray-600">Brak zgłoszeń w tym projekcie.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs text-gray-600">
                <tr>
                  <th className="py-2 pr-4">Oferta</th>
                  <th className="py-2 pr-4">Użytkownik</th>
                  <th className="py-2 pr-4">E-mail</th>
                  <th className="py-2 pr-4">Telefon</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {appliedVolunteers.map((v: any) => {
                  const canReview = Boolean(v.__offer.czy_ukonczone && v.__offer.wolontariusz && v.__offer.wolontariusz.id === v.id);
                  return (
                  <tr key={`${v.__offer.id}-${v.id}`} className="border-t">
                    <td className="py-2 pr-4">
                      <Link className="text-blue-600 hover:underline" to={`/organization/offers/${v.__offer.id}`}>{v.__offer.tytul_oferty}</Link>
                    </td>
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
                              await createReview({ oferta: v.__offer.id, ocena, komentarz, wolontariusz: v.id });
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
