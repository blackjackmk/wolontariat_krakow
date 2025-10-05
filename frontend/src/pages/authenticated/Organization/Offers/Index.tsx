import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { deleteOffer, getOffers } from '@/api/offers';
import { getProjects } from '@/api/projects';
import { getUsers } from '@/api/users';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function OrganizationOffersListPage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Oferta[]>([]);
  const [projects, setProjects] = useState<Projekt[]>([]);
  const [volunteers, setVolunteers] = useState<Uzytkownik[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [qProject, setQProject] = useState<string>('');
  const [qLocation, setQLocation] = useState<string>('');
  const [qStatus, setQStatus] = useState<'all' | 'open' | 'completed'>('all');
  const [qAssigned, setQAssigned] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [qVolunteer, setQVolunteer] = useState<string>('');

  useEffect(() => {
    Promise.all([getOffers(), getProjects(), getUsers()]).then(([o, p, u]) => {
      setOffers(o);
      setProjects(p);
      setVolunteers(u.filter(x => x.rola === 'wolontariusz'));
      setLoading(false);
    });
  }, []);

  const ownProjects = useMemo(() => {
    if (!user?.organizacja) return projects;
    return projects.filter(p => p.organizacja.id === user.organizacja!.id);
  }, [projects, user]);

  const ownOffers = useMemo(() => {
    let list = user?.organizacja ? offers.filter(o => o.organizacja.id === user.organizacja!.id) : offers;
    if (qProject) list = list.filter(o => String(o.projekt.id) === qProject);
    if (qLocation) list = list.filter(o => (o.lokalizacja || '').toLowerCase().includes(qLocation.toLowerCase()));
    if (qStatus !== 'all') list = list.filter(o => (qStatus === 'open' ? !o.czy_ukonczone : o.czy_ukonczone));
    if (qAssigned !== 'all') list = list.filter(o => (qAssigned === 'assigned' ? Boolean(o.wolontariusz) : !o.wolontariusz));
    if (qVolunteer) list = list.filter(o => (o.wolontariusz?.username || '').toLowerCase().includes(qVolunteer.toLowerCase()));
    return list;
  }, [offers, user, qProject, qLocation, qStatus, qAssigned, qVolunteer]);

  if (loading) return <div>Ładowanie…</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <aside className="md:col-span-3">
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Filtry</h2>
            <Button asChild size="sm" variant="outline">
              <Link to="/organization/offers/create"><Plus /> Nowa</Link>
            </Button>
          </div>
          <div className="space-y-2">
            <label className="text-sm">Projekt</label>
            <Select value={qProject} onValueChange={setQProject}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz projekt" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Wszystkie</SelectItem>
                {(user?.organizacja ? ownProjects : projects).map(p => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.nazwa_projektu}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
      <main className="md:col-span-9">
        <h1 className="text-2xl font-semibold mb-4">Oferty Organizacji</h1>
        {ownOffers.length === 0 ? (
          <div className="text-gray-600">Brak ofert dla wybranych filtrów.</div>
        ) : (
          <ul className="space-y-3">
            {ownOffers.map(o => (
              <li key={o.id} className="rounded border bg-white p-4">
                <div className="font-medium">{o.tytul_oferty}</div>
                {o.data && (
                  <div className="text-xs text-gray-600">Data: {new Date(o.data + 'T00:00:00').toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                )}
                <div className="text-sm text-gray-600">Projekt: {o.projekt.nazwa_projektu}</div>
                <div className="text-sm">Status: {o.czy_ukonczone ? 'Ukończone' : 'Otwarte'}</div>
                <div className="text-sm">Wolontariusz: {o.wolontariusz ? o.wolontariusz.username : 'Brak'}</div>
                <div className="mt-2 flex gap-2">
                  <Button asChild variant="outline">
                    <Link to={`/organization/offers/${o.id}`}><Eye /> Pokaż</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to={`/organization/offers/${o.id}/edit`}><Pencil /> Edytuj</Link>
                  </Button>
                  <Button variant="destructive" onClick={async () => {
                    setOffers(prev => prev.filter(x => x.id !== o.id));
                    try { await deleteOffer(o.id); } catch {}
                  }}>
                    <Trash2 /> Usuń
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
