import { useEffect, useMemo, useState } from 'react';
import { getProjects } from '@/api/projects';
import { useAuth } from '@/hooks/useAuth';

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
    if (!user?.nazwa_organizacji) return projects;
    return projects.filter(p => p.organizacja.nazwa_organizacji === user.nazwa_organizacji);
  }, [projects, user]);

  if (loading) return <div>Ładowanie projektów…</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Projekty Organizacji</h1>
      <ul className="space-y-3">
        {ownProjects.map(p => (
          <li key={p.id} className="rounded border bg-white p-4">
            <div className="font-medium">{p.nazwa_projektu}</div>
            <div className="text-sm text-gray-600">{p.opis_projektu}</div>
            <div className="text-sm mt-1">Organizacja: {p.organizacja.nazwa_organizacji}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

