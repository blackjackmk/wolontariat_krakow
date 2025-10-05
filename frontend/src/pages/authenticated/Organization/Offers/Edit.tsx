import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import { getProjects } from '@/api/projects';
import { getUsers } from '@/api/users';
import { getOffers, updateOffer } from '@/api/offers';
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
  wolontariusz_id: z.string().optional().superRefine(
    fieldConfig({ label: 'Wolontariusz (opcjonalnie)' })
  ),
  czy_ukonczone: z.boolean().superRefine(
    fieldConfig({ label: 'Czy ukończone?' })
  ),
});
const provider = new ZodProvider(offerSchema);

export default function OrganizationOffersEditPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const params = useParams();
  const id = Number(params.id);
  const [offer, setOffer] = useState<Oferta | null>(null);
  const [projects, setProjects] = useState<Projekt[]>([]);
  const [volunteers, setVolunteers] = useState<Uzytkownik[]>([]);

  useEffect(() => {
    Promise.all([getOffers(), getProjects(), getUsers()]).then(([o, p, u]) => {
      setOffer(o.find(x => x.id === id) || null);
      setProjects(p);
      setVolunteers(u.filter(x => x.rola === 'wolontariusz'));
    });
  }, [id]);

  const optionsProjects: [string, string][] = useMemo(() => (user?.organizacja ? projects.filter(p => p.organizacja.id === user.organizacja.id) : projects).map(p => [String(p.id), p.nazwa_projektu]), [projects, user]);
  const optionsVols: [string, string][] = useMemo(() => [['', '— Brak —'], ...volunteers.map(v => [String(v.id), v.username])], [volunteers]);

  if (!user?.organizacja) return <div>Brak uprawnień</div>;
  if (!offer) return <div>Nie znaleziono oferty</div>;

  return (
    <Card>
      <CardHeader className="text-lg font-semibold">Edytuj ofertę</CardHeader>
      <CardContent>
        <AutoForm
          schema={provider}
          fieldOptions={{
            projekt_id: { options: optionsProjects },
            wolontariusz_id: { options: optionsVols },
          }}
          defaultValues={{
            tytul_oferty: offer.tytul_oferty,
            projekt_id: String(offer.projekt.id),
            lokalizacja: offer.lokalizacja ?? '',
            wolontariusz_id: offer.wolontariusz ? String(offer.wolontariusz.id) : '',
            czy_ukonczone: offer.czy_ukonczone,
          }}
          onSubmit={async (data) => {
            const projekt = projects.find(p => p.id === Number(data.projekt_id));
            if (!projekt) return;
            try {
              await updateOffer(id, {
                tytul_oferty: data.tytul_oferty,
                projekt: projekt.id,
                lokalizacja: data.lokalizacja,
                wolontariusz: data.wolontariusz_id ? Number(data.wolontariusz_id) : null,
                czy_ukonczone: data.czy_ukonczone,
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
