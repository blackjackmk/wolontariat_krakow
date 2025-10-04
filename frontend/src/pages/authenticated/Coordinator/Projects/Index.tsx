import { useEffect, useMemo, useState } from 'react';
import { getProjects } from '@/api/projects';
import { getOffers, assignVolunteer } from '@/api/offers';
import { mockUzytkownicy } from '@/mock-data/data';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function CoordinatorProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Projekt[]>([]);
  const [offers, setOffers] = useState<Oferta[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignMap, setAssignMap] = useState<Record<number, number | ''>>({});

  useEffect(() => {
    Promise.all([getProjects(), getOffers()]).then(([ps, os]) => {
      setProjects(ps);
      setOffers(os);
      setLoading(false);
    });
  }, []);

  const ownProjects = useMemo(() => {
    if (!user?.organizacja) return projects;
    return projects.filter(p => p.organizacja.id === user.organizacja!.id);
  }, [projects, user]);

  const offersByProject = useMemo(() => {
    const map: Record<number, Oferta[]> = {};
    for (const o of offers) {
      const pid = o.projekt.id;
      if (!map[pid]) map[pid] = [];
      map[pid].push(o);
    }
    return map;
  }, [offers]);

  const volunteers = useMemo(() => mockUzytkownicy.filter(u => u.rola === 'wolontariusz'), []);

  const gradientFor = (id: number) => {
    const hues = [220, 280, 200, 160, 340, 20];
    const h = hues[id % hues.length];
    return `linear-gradient(135deg, hsl(${h} 85% 75%), hsl(${(h + 40) % 360} 90% 65%))`;
  };

  if (loading) return <div>Ładowanie projektów…</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <aside className="md:col-span-3 space-y-2">
        <h2 className="text-lg font-semibold">Projekty (Koordynator)</h2>
        <p className="text-sm text-gray-600">Zarządzaj uczestnikami i ofertami.</p>
      </aside>
      <main className="md:col-span-9">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ownProjects.map(p => (
            <Card key={p.id} className="overflow-hidden">
              <div className="h-28 w-full" style={{ backgroundImage: gradientFor(p.id) }} />
              <div className="p-4 space-y-2">
                <div className="font-semibold">{p.nazwa_projektu}</div>
                <div className="text-sm text-gray-600 line-clamp-2">{p.opis_projektu}</div>
                <div className="text-xs text-gray-600">{p.organizacja.nazwa_organizacji}</div>

                <div className="pt-2 space-y-2">
                  <div className="text-sm font-medium">Oferty</div>
                  {(offersByProject[p.id] || []).map(o => (
                    <div key={o.id} className="rounded border p-2">
                      <div className="text-sm font-medium">{o.tytul_oferty}</div>
                      <div className="text-xs text-gray-600">
                        Uczestnicy: {o.liczba_uczestnikow ?? (o.wolontariusz ? 1 : 0)}{o.limit_uczestnikow ? ` / ${o.limit_uczestnikow}` : ''}
                      </div>
                      <div className="flex gap-2 pt-2 items-center">
                        <Select
                          value={(assignMap[o.id] ?? '').toString()}
                          onValueChange={(v) => setAssignMap(prev => ({ ...prev, [o.id]: v ? Number(v) : '' }))}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Wybierz osobę" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">—</SelectItem>
                            {volunteers.map(v => (
                              <SelectItem key={v.id} value={String(v.id)}>{v.username}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          onClick={async () => {
                            const vid = assignMap[o.id];
                            if (!vid || typeof vid !== 'number') return;
                            const updated = await assignVolunteer(o.id, vid);
                            if (updated) setOffers(prev => prev.map(x => (x.id === o.id ? { ...x, ...updated } : x)));
                          }}
                        >
                          Przypisz
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
