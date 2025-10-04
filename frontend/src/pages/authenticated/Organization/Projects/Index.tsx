import { useEffect, useMemo, useState } from 'react';
import { getProjects } from '@/api/projects';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { mockProjekty } from '@/mock-data/data';

export default function OrganizationProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Projekt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects().then(data => {
      setProjects(data);
      setLoading(false);
    });
  }, []);

  const ownProjects = useMemo(() => {
    if (!user?.organizacja) return projects;
    return projects.filter(p => p.organizacja.id === user.organizacja!.id);
  }, [projects, user]);

  if (loading) return <div>Ładowanie projektów…</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Projekty Organizacji</h1>

      <div className="mb-4">
        <Button asChild>
          <Link to="/organization/projects/create"><Plus /> Dodaj nowy projekt</Link>
        </Button>
      </div>

      <ul className="space-y-3">
        {ownProjects.map(p => (
          <li key={p.id} className="rounded border bg-white p-4">
            <div className="font-medium">{p.nazwa_projektu}</div>
            <div className="text-sm text-gray-600">{p.opis_projektu}</div>
            <div className="text-sm mt-1">Organizacja: {p.organizacja.nazwa_organizacji}</div>
            <div className="mt-2 flex gap-2">
              <Button asChild variant="outline">
                <Link to={`/organization/projects/${p.id}`}><Eye /> Pokaż</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to={`/organization/projects/${p.id}/edit`}><Pencil /> Edytuj</Link>
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setProjects(prev => prev.filter(x => x.id !== p.id));
                  const idx = mockProjekty.findIndex(x => x.id === p.id);
                  if (idx >= 0) mockProjekty.splice(idx, 1);
                }}
              >
                <Trash2 /> Usuń
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
