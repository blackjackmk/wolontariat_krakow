import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '@/api/projects';
import { getUsers } from '@/api/users';
import { createOffer } from '@/api/offers';
import { AutoForm } from '@/components/ui/autoform';
import { SubmitButton } from '@/components/ui/autoform/components/SubmitButton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ZodProvider, fieldConfig } from '@autoform/zod';
import z from 'zod';

const offerSchema = z.object({
  tytul_oferty: z.string().min(1).max(255).superRefine(
    fieldConfig({ label: 'Tytuł oferty', inputProps: { placeholder: 'Tytuł' } })
  ),
  projekt_id: z.string().min(1).superRefine(
    fieldConfig({ label: 'Projekt' })
  ),
  lokalizacja: z.string().min(1).superRefine(
    fieldConfig({ label: 'Lokalizacja', inputProps: { placeholder: 'np. Kraków' } })
  ),
});
const provider = new ZodProvider(offerSchema);

export default function OrganizationOffersCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Projekt[]>([]);
  const [volunteers, setVolunteers] = useState<Uzytkownik[]>([]);

  useEffect(() => {
    Promise.all([getProjects(), getUsers()]).then(([p, u]) => {
      setProjects(p);
      setVolunteers(u.filter(x => x.rola === 'wolontariusz'));
    });
  }, []);

  const optionsProjects: [string, string][] = useMemo(() => (user?.organizacja ? projects.filter(p => p.organizacja.id === user.organizacja.id) : projects).map(p => [String(p.id), p.nazwa_projektu]), [projects, user]);
  const optionsVols: [string, string][] = useMemo(() => [['', '— Brak —'], ...volunteers.map(v => [String(v.id), v.username])], [volunteers]);

  if (!user?.organizacja) return <div>Brak uprawnień</div>;

  return (
    <Card>
      <CardHeader className="text-lg font-semibold">Dodaj ofertę</CardHeader>
      <CardContent>
        <AutoForm
          schema={provider}
          fieldOptions={{
            projekt_id: { options: optionsProjects },
          }}
          onSubmit={async (data) => {
            try {
              await createOffer({
                projekt: Number(data.projekt_id),
                tytul_oferty: data.tytul_oferty,
                lokalizacja: data.lokalizacja,
              });
            } finally {
              navigate('/organization/offers');
            }
          }}
        >
          <SubmitButton>Zapisz</SubmitButton>
        </AutoForm>
      </CardContent>
    </Card>
  );
}
