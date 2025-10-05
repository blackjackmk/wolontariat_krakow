import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';
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
  lokalizacja: z.string().min(1).superRefine(
    fieldConfig({ label: 'Lokalizacja', inputProps: { placeholder: 'np. Kraków' } })
  ),
  tematyka: z.string().optional().superRefine(
    fieldConfig({ label: 'Tematyka', inputProps: { placeholder: 'np. Ekologia' } })
  ),
  czas_trwania: z.string().optional().superRefine(
    fieldConfig({ label: 'Czas trwania', inputProps: { placeholder: 'np. 2-3h tygodniowo' } })
  ),
  wymagania: z.string().optional().superRefine(
    fieldConfig({ label: 'Wymagania', inputProps: { placeholder: 'np. komunikatywność' } })
  ),
});
const provider = new ZodProvider(offerSchema);

export default function OrganizationOffersCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState<Projekt[]>([]);
  const [volunteers, setVolunteers] = useState<Uzytkownik[]>([]);

  useEffect(() => {
    Promise.all([getProjects(), getUsers()]).then(([p, u]) => {
      setProjects(p);
      setVolunteers(u.filter(x => x.rola === 'wolontariusz'));
    });
  }, []);

  const optionsProjects: [string, string][] = useMemo(() => {
    const rawOrg = (user as any)?.organizacja;
    const orgId: number | null = rawOrg
      ? (typeof rawOrg === 'number' ? rawOrg as number : (rawOrg.id as number))
      : null;
    const list = orgId ? projects.filter(p => p.organizacja.id === orgId) : projects;
    return list.map(p => [String(p.id), p.nazwa_projektu]);
  }, [projects, user]);
  const optionsVols: [string, string][] = useMemo(() => [['', '— Brak —'], ...volunteers.map(v => [String(v.id), v.username])], [volunteers]);

  if (!user?.organizacja) return <div>Brak uprawnień</div>;

  const preselectProject = (() => {
    const sp = new URLSearchParams(location.search);
    const pid = sp.get('project');
    return pid ? String(Number(pid)) : '';
  })();

  return (
    <Card>
      <CardHeader className="text-lg font-semibold">Dodaj ofertę</CardHeader>
      <CardContent>
        <AutoForm
          schema={provider}
          fieldOptions={{
            projekt_id: { options: optionsProjects },
          }}
          defaultValues={{
            tytul_oferty: '',
            lokalizacja: '',
            tematyka: '',
            czas_trwania: '',
            wymagania: '',
          }}
          onSubmit={async (data) => {
            try {
              await createOffer({
                projekt: Number(preselectProject),
                tytul_oferty: data.tytul_oferty,
                lokalizacja: data.lokalizacja,
                tematyka: data.tematyka || undefined,
                czas_trwania: data.czas_trwania || undefined,
                wymagania: data.wymagania || undefined,
              });
            } finally {
              navigate(`/organization/projects/${preselectProject}`);
            }
          }}
        >
          <SubmitButton>Zapisz</SubmitButton>
        </AutoForm>
      </CardContent>
    </Card>
  );
}
