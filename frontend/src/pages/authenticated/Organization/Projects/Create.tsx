import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { createProject, getProjects } from '@/api/projects';
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

export default function OrganizationProjectsCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Projekt[]>([]);

  useEffect(() => {
    getProjects().then(setProjects);
  }, []);


  if (user?.rola !== 'organizacja') return <div>Brak uprawnień</div>;
  if (!user?.organizacja) return <div>Brak przypisanej organizacji do konta. Skontaktuj się z administratorem.</div>;

  return (
    <Card>
      <CardHeader className="text-lg font-semibold">Dodaj projekt</CardHeader>
      <CardContent>
        <AutoForm
          schema={provider}
          onSubmit={async (data) => {
            try {
              console.log(user);
              await createProject({ 
                nazwa_projektu: data.nazwa_projektu, 
                opis_projektu: data.opis_projektu,
                organizacja: user.organizacja?.id,
              });
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
