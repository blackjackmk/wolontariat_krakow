import { useEffect, useMemo, useState } from 'react';
import { getProjects } from '@/api/projects';
import { getOffers, assignVolunteer } from '@/api/offers';
import { getUsers } from '@/api/users';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function CoordinatorProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Projekt[]>([]);
  const [offers, setOffers] = useState<Oferta[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignMap, setAssignMap] = useState<Record<number, number | ''>>({});
  const [volunteers, setVolunteers] = useState<Uzytkownik[]>([]);
  // Filters
  const [qSearchProject, setQSearchProject] = useState('');
  const [qLocation, setQLocation] = useState('');
  const [qStatus, setQStatus] = useState<'all' | 'open' | 'completed'>('all');
  const [qAssigned, setQAssigned] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [qVolunteer, setQVolunteer] = useState<string>('');

  useEffect(() => {
    Promise.all([getProjects(), getOffers(), getUsers()]).then(([ps, os, us]) => {
      setProjects(ps);
      setOffers(os);
      setVolunteers(us.filter(u => u.rola === 'wolontariusz'));
      setLoading(false);
    });
  }, []);

  const ownProjects = useMemo(() => {
    let list = user?.organizacja ? projects.filter(p => p.organizacja.id === user.organizacja!.id) : projects;
    if (qSearchProject) {
      const q = qSearchProject.toLowerCase();
      list = list.filter(p => p.nazwa_projektu.toLowerCase().includes(q) || p.opis_projektu.toLowerCase().includes(q));
    }
    return list;
  }, [projects, user, qSearchProject]);

  const offersByProject = useMemo(() => {
    const map: Record<number, Oferta[]> = {};
    let list = offers;
    if (qLocation) list = list.filter(o => (o.lokalizacja || '').toLowerCase().includes(qLocation.toLowerCase()));
    if (qStatus !== 'all') list = list.filter(o => (qStatus === 'open' ? !o.czy_ukonczone : o.czy_ukonczone));
    if (qAssigned !== 'all') list = list.filter(o => (qAssigned === 'assigned' ? Boolean(o.wolontariusz) : !o.wolontariusz));
    if (qVolunteer) list = list.filter(o => (o.wolontariusz?.username || '').toLowerCase().includes(qVolunteer.toLowerCase()));

    for (const o of list) {
      const pid = o.projekt.id;
      if (!map[pid]) map[pid] = [];
      map[pid].push(o);
    }
    return map;
  }, [offers, qLocation, qStatus, qAssigned, qVolunteer]);

  // volunteers loaded from API (with fallback in getUsers())

  const gradientFor = (id: number) => {
    const hues = [220, 280, 200, 160, 340, 20];
    const h = hues[id % hues.length];
    return `linear-gradient(135deg, hsl(${h} 85% 75%), hsl(${(h + 40) % 360} 90% 65%))`;
  };

  if (loading) return <div>Ładowanie projektów…</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <aside className="md:col-span-4 space-y-3">
        <Card className="p-4 ">
          <h2 className="text-lg font-semibold">Projekty (Koordynator)</h2>
          <p className="text-sm text-gray-600">Zarządzaj uczestnikami i ofertami.</p>
          <div className="space-y-2">
            <label className="text-sm">Szukaj projektu</label>
            <Input placeholder="nazwa lub opis" value={qSearchProject} onChange={e => setQSearchProject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Lokalizacja</label>
            <Input placeholder="np. Kraków" value={qLocation} onChange={e => setQLocation(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Status</label>
            <Select value={qStatus} onValueChange={(v) => setQStatus(v as typeof qStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="open">Otwarte</SelectItem>
                <SelectItem value="completed">Ukończone</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm">Przypisanie</label>
            <Select value={qAssigned} onValueChange={(v) => setQAssigned(v as typeof qAssigned)}>
              <SelectTrigger>
                <SelectValue placeholder="Przypisanie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="assigned">Przypisane</SelectItem>
                <SelectItem value="unassigned">Nieprzypisane</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm">Wolontariusz</label>
            <Input placeholder="nazwa użytkownika" value={qVolunteer} onChange={e => setQVolunteer(e.target.value)} />
          </div>
        </Card>
      </aside>
      <main className="md:col-span-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {ownProjects.map(p => (
            <Card key={p.id} className="overflow-hidden pt-0 pb-2 gap-0">
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
