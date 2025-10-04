import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '@/api/projects';
import { AutoForm } from '@/components/ui/autoform';
import { SubmitButton } from '@/components/ui/autoform/components/SubmitButton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ZodProvider, fieldConfig } from '@autoform/zod';
import z from 'zod';
import { mockProjekty } from '@/mock-data/data';

const projectSchema = z.object({
  nazwa_projektu: z.string().min(1).max(255).superRefine(
    fieldConfig({ label: 'Nazwa projektu', inputProps: { placeholder: 'Nazwa' } })
  ),
  opis_projektu: z.string().min(1).superRefine(
    fieldConfig({ label: 'Opis projektu', inputProps: { placeholder: 'Opis' } })
  ),
});
const provider = new ZodProvider(projectSchema);

export default function OrganizationProjectsCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Projekt[]>([]);

  useEffect(() => {
    getProjects().then(setProjects);
  }, []);

  const nextId = useMemo(() => (projects.reduce((m, p) => Math.max(m, p.id), 0) || 0) + 1, [projects]);

  if (!user?.organizacja) return <div>Brak uprawnień</div>;

  return (
    <Card>
      <CardHeader className="text-lg font-semibold">Dodaj projekt</CardHeader>
      <CardContent>
        <AutoForm
          schema={provider}
          onSubmit={(data) => {
            const newProject: Projekt = { id: nextId, organizacja: user.organizacja!, ...data };
            mockProjekty.push(newProject);
            navigate('/organization/projects');
          }}
        >
          <SubmitButton>Zapisz</SubmitButton>
        </AutoForm>
      </CardContent>
    </Card>
  );
}

