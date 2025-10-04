import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '@/api/projects';
import { getUsers } from '@/api/users';
import { AutoForm } from '@/components/ui/autoform';
import { SubmitButton } from '@/components/ui/autoform/components/SubmitButton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ZodProvider, fieldConfig } from '@autoform/zod';
import z from 'zod';
import { mockOferty } from '@/mock-data/data';

const offerSchema = z.object({
  tytul_oferty: z.string().min(1).max(255).superRefine(
    fieldConfig({ label: 'Tytuł oferty', inputProps: { placeholder: 'Tytuł' } })
  ),
  projekt_id: z.string().min(1).superRefine(
    fieldConfig({ label: 'Projekt' })
  ),
  wolontariusz_id: z.string().optional().superRefine(
    fieldConfig({ label: 'Wolontariusz (opcjonalnie)' })
  ),
  czy_ukonczone: z.boolean().superRefine(
    fieldConfig({ label: 'Czy ukończone?' })
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
  const nextId = useMemo(() => (mockOferty.reduce((m, o) => Math.max(m, o.id), 0) || 0) + 1, []);

  if (!user?.organizacja) return <div>Brak uprawnień</div>;

  return (
    <Card>
      <CardHeader className="text-lg font-semibold">Dodaj ofertę</CardHeader>
      <CardContent>
        <AutoForm
          schema={provider}
          fieldOptions={{
            projekt_id: { options: optionsProjects },
            wolontariusz_id: { options: optionsVols },
          }}
          onSubmit={(data) => {
            const projekt = projects.find(p => p.id === Number(data.projekt_id));
            const wol = data.wolontariusz_id ? volunteers.find(v => v.id === Number(data.wolontariusz_id)) ?? null : null;
            if (!projekt) return;
            const newOffer: Oferta = {
              id: nextId,
              tytul_oferty: data.tytul_oferty,
              projekt,
              organizacja: user.organizacja!,
              wolontariusz: wol,
              czy_ukonczone: data.czy_ukonczone,
            };
            mockOferty.push(newOffer);
            navigate('/organization/offers');
          }}
        >
          <SubmitButton>Zapisz</SubmitButton>
        </AutoForm>
      </CardContent>
    </Card>
  );
}

