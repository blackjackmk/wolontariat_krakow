import { useEffect, useMemo, useState } from 'react';
import { getMyOffers } from '@/api/offers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { downloadOfferCertificate } from '@/api/offers';
import { useAuth } from '@/hooks/useAuth';

export default function VolunteerAppliedOffersPage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Oferta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOffers().then((os) => {
      setOffers(os);
      setLoading(false);
    });
  }, []);

  const sorted = useMemo(() => {
    // Completed first for convenience
    return [...offers].sort((a, b) => Number(b.czy_ukonczone) - Number(a.czy_ukonczone));
  }, [offers]);

  const isAssigned = (o: Oferta): boolean => {
    if (!user) return false;
    if (o.wolontariusze && Array.isArray(o.wolontariusze)) {
      return o.wolontariusze.some((w) => w.id === user.id);
    }
    if (o.wolontariusz) {
      return o.wolontariusz.id === user.id;
    }
    return false;
  };

  if (loading) return <div>Ładowanie…</div>;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Zgłoszone oferty</h1>
      {user?.rola === 'wolontariusz' && (
        <div className={`inline-flex items-center gap-2 -mt-2 text-xs px-2 py-1 rounded border ${user?.czy_maloletni ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 'bg-emerald-50 border-emerald-300 text-emerald-700'}`}>
          Status konta: {user?.czy_maloletni ? 'Małoletni' : 'Pełnoletni'}{typeof user?.wiek === 'number' ? ` (${user?.wiek} lat)` : ''}
        </div>
      )}
      <Card className="p-4">
        {sorted.length === 0 ? (
          <div className="text-sm text-gray-600">Brak zgłoszonych ofert.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 pr-3">Tytuł</th>
                  <th className="py-2 pr-3">Projekt</th>
                  <th className="py-2 pr-3">Organizacja</th>
                  <th className="py-2 pr-3">Data</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((o) => (
                  <tr key={o.id} className="border-t">
                    <td className="py-2 pr-3">{o.tytul_oferty}</td>
                    <td className="py-2 pr-3">{o.projekt.nazwa_projektu}</td>
                    <td className="py-2 pr-3">{o.organizacja.nazwa_organizacji}</td>
                    <td className="py-2 pr-3">{o.data ? new Date(o.data + 'T00:00:00').toLocaleDateString('pl-PL', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '—'}</td>
                    <td className="py-2 pr-3">{o.czy_ukonczone ? 'Ukończone' : 'Otwarte'}</td>
                    <td className="py-2 pr-3">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!o.czy_ukonczone || !isAssigned(o)}
                        onClick={async () => {
                          try {
                            await downloadOfferCertificate(o.id);
                          } catch (err: any) {
                            const detail = err?.response?.data?.detail || err?.response?.data?.error || err?.message;
                            window.alert(detail || 'Nie udało się pobrać certyfikatu. Upewnij się, że jesteś przypisany do oferty.');
                          }
                        }}
                        title={
                          !o.czy_ukonczone
                            ? 'Certyfikat dostępny po ukończeniu'
                            : isAssigned(o)
                              ? 'Pobierz certyfikat'
                              : 'Certyfikat dostępny tylko dla przypisanych wolontariuszy'
                        }
                      >
                        Pobierz certyfikat
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </section>
  );
}
