import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Pencil, ArrowLeft } from 'lucide-react';
import { getProjects } from '@/api/projects';

export default function OrganizationProjectsShowPage() {
  const params = useParams();
  const id = Number(params.id);
  const [project, setProject] = useState<Projekt | null>(null);

  useEffect(() => {
    getProjects().then(all => setProject(all.find(p => p.id === id) || null));
  }, [id]);

  if (!project) return <div>Nie znaleziono projektu</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">{project.nazwa_projektu}</h1>
      <div className="mb-4 text-gray-700">{project.opis_projektu}</div>
      <div className="text-sm">Organizacja: {project.organizacja.nazwa_organizacji}</div>
      <div className="mt-4 flex gap-2">
        <Button asChild>
          <Link to={`/organization/projects/${project.id}/edit`}><Pencil /> Edytuj</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to={`/organization/projects`}><ArrowLeft /> Wróć</Link>
        </Button>
      </div>
    </div>
  );
}
