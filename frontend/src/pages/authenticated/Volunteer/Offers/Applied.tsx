import { useEffect, useMemo, useState } from 'react';
import { getMyOffers } from '@/api/offers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { downloadOfferCertificate } from '@/api/offers';

export default function VolunteerAppliedOffersPage() {
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

  if (loading) return <div>Ładowanie…</div>;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Zgłoszone oferty</h1>
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
                    <td className="py-2 pr-3">{o.czy_ukonczone ? 'Ukończone' : 'Otwarte'}</td>
                    <td className="py-2 pr-3">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!o.czy_ukonczone}
                        onClick={() => downloadOfferCertificate(o.id)}
                        title={o.czy_ukonczone ? 'Pobierz certyfikat' : 'Certyfikat dostępny po ukończeniu'}
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
