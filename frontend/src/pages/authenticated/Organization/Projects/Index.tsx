import { useEffect, useMemo, useState } from 'react';
import { getProjects } from '@/api/projects';
import { getOffers } from '@/api/offers';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { deleteProject } from '@/api/projects';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function OrganizationProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Projekt[]>([]);
  const [offers, setOffers] = useState<Oferta[]>([]);
  const [loading, setLoading] = useState(true);
  const [qSearch, setQSearch] = useState('');
  const [qHasOpen, setQHasOpen] = useState<'all'|'yes'|'no'>('all');

  useEffect(() => {
    Promise.all([getProjects(), getOffers()]).then(([ps, os]) => {
      setProjects(ps);
      setOffers(os);
      setLoading(false);
    });
  }, []);

  const openByProject = useMemo(() => {
    const map: Record<number, number> = {};
    for (const o of offers) {
      if (!o.czy_ukonczone) map[o.projekt.id] = (map[o.projekt.id] || 0) + 1;
    }
    return map;
  }, [offers]);

  const ownProjects = useMemo(() => {
    let list = user?.organizacja ? projects.filter(p => p.organizacja.id === user.organizacja!.id) : projects;
    if (qSearch) {
      const q = qSearch.toLowerCase();
      list = list.filter(p => p.nazwa_projektu.toLowerCase().includes(q) || p.opis_projektu.toLowerCase().includes(q));
    }
    if (qHasOpen !== 'all') {
      list = list.filter(p => (qHasOpen === 'yes') ? (openByProject[p.id] ?? 0) > 0 : (openByProject[p.id] ?? 0) === 0);
    }
    return list;
  }, [projects, user, qSearch, qHasOpen, openByProject]);

  if (loading) return <div>Ładowanie projektów…</div>;

  const gradientFor = (id: number) => {
    const hues = [15, 45, 95, 165, 205, 255, 300];
    const h = hues[id % hues.length];
    return `linear-gradient(135deg, hsl(${h} 85% 75%), hsl(${(h + 50) % 360} 90% 65%))`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <aside className="md:col-span-3">
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Filtry</h2>
            <Button asChild size="sm" variant="outline">
              <Link to="/organization/projects/create"><Plus /> Nowy</Link>
            </Button>
          </div>
          <div className="space-y-2">
            <label className="text-sm">Szukaj</label>
            <Input placeholder="nazwa lub opis" value={qSearch} onChange={e => setQSearch(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Otwarte oferty</label>
            <Select value={qHasOpen} onValueChange={(v) => setQHasOpen(v as typeof qHasOpen)}>
              <SelectTrigger>
                <SelectValue placeholder="Filtruj" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="yes">Z otwartymi</SelectItem>
                <SelectItem value="no">Bez otwartych</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </aside>

      <div className="md:col-span-9 grid sm:grid-cols-2 gap-4">
        {ownProjects.map(p => (
          <Card key={p.id} className="overflow-hidden pt-0 pb-2 gap-0">
            <div className="h-28 w-full" style={{ backgroundImage: gradientFor(p.id) }} />
            <div className="p-4 space-y-2">
              <div className="font-medium">{p.nazwa_projektu}</div>
              <div className="text-sm text-gray-600 line-clamp-2">{p.opis_projektu}</div>
              <div className="text-xs text-gray-600">{p.organizacja.nazwa_organizacji}</div>
              <div className="mt-2 flex gap-2">
                <Button asChild variant="outline">
                  <Link to={`/organization/projects/${p.id}`}><Eye /> Pokaż</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to={`/organization/projects/${p.id}/edit`}><Pencil /> Edytuj</Link>
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    setProjects(prev => prev.filter(x => x.id !== p.id));
                    try { await deleteProject(p.id); } catch {}
                  }}
                >
                  <Trash2 /> Usuń
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
