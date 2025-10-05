import { useEffect, useMemo, useState } from 'react';
import { applyToOffer, getOffers } from '@/api/offers';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';

export default function VolunteerOffersPage() {
  const [offers, setOffers] = useState<Oferta[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // filters
  const [qTopic, setQTopic] = useState<string>('');
  const [qLocation, setQLocation] = useState<string>('');
  const [qDuration, setQDuration] = useState<string>('');
  const [qRequirements, setQRequirements] = useState<string>('');
  const [qOrganizer, setQOrganizer] = useState<string>('');

  useEffect(() => {
    getOffers().then(data => {
      setOffers(data);
      setLoading(false);
    });
  }, []);

  const topics = useMemo(
    () => Array.from(new Set(offers.map(o => o.tematyka).filter(Boolean))) as string[],
    [offers]
  );
  const durations = useMemo(
    () => Array.from(new Set(offers.map(o => o.czas_trwania).filter(Boolean))) as string[],
    [offers]
  );

  if (loading) return <div>Ładowanie ofert…</div>;

  const filtered = offers.filter(o => {
    if (qTopic && (o.tematyka || '').toLowerCase() !== qTopic.toLowerCase()) return false;
    if (qLocation && !(o.lokalizacja || '').toLowerCase().includes(qLocation.toLowerCase())) return false;
    if (qDuration && (o.czas_trwania || '').toLowerCase() !== qDuration.toLowerCase()) return false;
    if (qOrganizer && !o.organizacja.nazwa_organizacji.toLowerCase().includes(qOrganizer.toLowerCase())) return false;
    if (qRequirements) {
      const req = (o.wymagania || '').toLowerCase();
      if (!req.includes(qRequirements.toLowerCase())) return false;
    }
    return true;
  });

  const handleApply = async (id: number) => {
    if (!user) return;
    const updated = await applyToOffer(id, user);
    if (!updated) return;
    setOffers(prev => prev.map(o => (o.id === id ? { ...o, ...updated } : o)));
  };

  const gradientFor = (id: number) => {
    const hues = [220, 280, 200, 160, 340, 20];
    const h = hues[id % hues.length];
    return `linear-gradient(135deg, hsl(${h} 85% 75%), hsl(${(h + 40) % 360} 90% 65%))`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-3">
        <Card className="space-y-2 p-4 gap-0">
          <h2 className="text-lg font-semibold">Filtry</h2>
          <div className="space-y-2">
            <label className="text-sm">Temat</label>
            <Select onValueChange={setQTopic} value={qTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz temat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                {topics.map(t => (
                  <SelectItem key={t} value={t ?? '-'}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm">Lokalizacja</label>
            <Input placeholder="np. Kraków" value={qLocation} onChange={e => setQLocation(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Czas trwania</label>
            <Select onValueChange={setQDuration} value={qDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz czas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                {durations.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm">Organizator</label>
            <Input placeholder="nazwa organizacji" value={qOrganizer} onChange={e => setQOrganizer(e.target.value)} />
          </div>
        </Card>
      </div>

      <main className="md:col-span-9">
        <h1 className="text-2xl font-semibold mb-4">Oferty dla wolontariuszy</h1>
        {filtered.length === 0 ? (
          <div className="text-gray-600">Brak ofert dla wybranych filtrów.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(oferta => (
              <Card key={oferta.id} className="overflow-hidden pt-0 pb-2 gap-4">
                <div
                  className="h-28 w-full"
                  style={{ backgroundImage: gradientFor(oferta.id) }}
                />
                <div className="p-4 pt-0 gap-2 flex flex-col grow">
                  <div className="font-semibold leading-tight">{oferta.tytul_oferty}</div>
                  <div className="text-xs text-gray-600">
                    {oferta.organizacja.nazwa_organizacji} • {oferta.projekt.nazwa_projektu}
                  </div>
                  <div className="text-sm flex flex-wrap gap-2">
                    {oferta.lokalizacja && <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">{oferta.lokalizacja}</span>}
                    {oferta.czas_trwania && <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">{oferta.czas_trwania}</span>}
                    {oferta.tematyka && <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">{oferta.tematyka}</span>}
                  </div>
                  <div className="text-xs text-gray-600">
                    Uczestnicy: {oferta.liczba_uczestnikow ?? (oferta.wolontariusz ? 1 : 0)}
                  </div>
                  <div className="flex gap-2 pt-2 mt-auto">
                    <Button
                      size="sm"
                      onClick={() => handleApply(oferta.id)}
                      disabled={Boolean(
                        oferta.czy_ukonczone ||
                        (user && ((oferta.wolontariusze || []).some(u => u.id === user.id) || (oferta.wolontariusz && oferta.wolontariusz.id === user.id)))
                      )}
                    >
                      {oferta.czy_ukonczone
                        ? 'Zakończona'
                        : user && ((oferta.wolontariusze || []).some(u => u.id === user.id) || (oferta.wolontariusz && oferta.wolontariusz.id === user.id))
                        ? 'Zgłoszono'
                        : 'Aplikuj'}
                    </Button>
                    {/* Placeholder detail link; route added separately */}
                    <Link
                      className="text-sm text-blue-600 hover:underline self-center"
                      to={`/volunteer/offers/${oferta.id}`}
                    >
                      Szczegóły
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
