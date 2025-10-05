import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import { getProjects } from '@/api/projects';
import { getUsers } from '@/api/users';
import { getOfferById, updateOffer } from '@/api/offers';
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

  useEffect(() => {
    getOfferById(id).then((o) => {
      setOffer(o || null);
    });
  }, [id]);

  if (!user?.organizacja) return <div>Brak uprawnień</div>;
  if (!offer) return <div>Nie znaleziono oferty</div>;

  return (
    <Card>
      <CardHeader className="text-lg font-semibold">Edytuj ofertę</CardHeader>
      <CardContent>
        <AutoForm
          schema={provider}
          defaultValues={{
            tytul_oferty: offer.tytul_oferty,
            lokalizacja: offer.lokalizacja ?? '',
            tematyka: offer.tematyka ?? '',
            czas_trwania: offer.czas_trwania ?? '',
            wymagania: offer.wymagania ?? '',
            czy_ukonczone: offer.czy_ukonczone,
          }}
          onSubmit={async (data) => {
            try {
              await updateOffer(id, {
                tytul_oferty: data.tytul_oferty,
                lokalizacja: data.lokalizacja,
                tematyka: data.tematyka || '',
                czas_trwania: data.czas_trwania || '',
                wymagania: data.wymagania || '',
                czy_ukonczone: data.czy_ukonczone,
              });
            } finally {
              navigate(`/organization/projects/${offer.projekt.id}`);
            }
          }}
        >
          <SubmitButton>Zapisz</SubmitButton>
        </AutoForm>
      </CardContent>
    </Card>
  );
}
