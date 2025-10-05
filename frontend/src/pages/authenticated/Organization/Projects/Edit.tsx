import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import { getProjects, updateProject } from '@/api/projects';
import { AutoForm } from '@/components/ui/autoform';
import { SubmitButton } from '@/components/ui/autoform/components/SubmitButton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ZodProvider, fieldConfig } from '@autoform/zod';
import z from 'zod';

const projectSchema = z.object({
  nazwa_projektu: z.string().min(1).max(255).superRefine(
    fieldConfig({ label: 'Nazwa projektu', inputProps: { placeholder: 'Nazwa' } })
  ),
  opis_projektu: z.string().min(1).superRefine(
    fieldConfig({ label: 'Opis projektu', inputProps: { placeholder: 'Opis' } })
  ),
});
const provider = new ZodProvider(projectSchema);

export default function OrganizationProjectsEditPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const params = useParams();
  const id = Number(params.id);
  const [project, setProject] = useState<Projekt | null>(null);

  useEffect(() => {
    getProjects().then(all => setProject(all.find(p => p.id === id) || null));
  }, [id]);

  if (!user?.organizacja) return <div>Brak uprawnień</div>;
  if (!project) return <div>Nie znaleziono projektu</div>;

  return (
    <Card>
      <CardHeader className="text-lg font-semibold">Edytuj projekt</CardHeader>
      <CardContent>
        <AutoForm
          schema={provider}
          defaultValues={{ nazwa_projektu: project.nazwa_projektu, opis_projektu: project.opis_projektu }}
          onSubmit={async (data) => {
            try {
              await updateProject(id, { nazwa_projektu: data.nazwa_projektu, opis_projektu: data.opis_projektu });
            } finally {
              navigate('/organization/projects');
            }
          }}
        >
          <SubmitButton>Zapisz</SubmitButton>
        </AutoForm>
      </CardContent>
    </Card>
  );
}
