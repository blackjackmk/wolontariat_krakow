import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Pencil, ArrowLeft } from 'lucide-react';
import { getOffers } from '@/api/offers';

export default function OrganizationOffersShowPage() {
  const params = useParams();
  const id = Number(params.id);
  const [offer, setOffer] = useState<Oferta | null>(null);

  useEffect(() => {
    getOffers().then(all => setOffer(all.find(o => o.id === id) || null));
  }, [id]);

  if (!offer) return <div>Nie znaleziono oferty</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">{offer.tytul_oferty}</h1>
      <div className="text-sm">Projekt: {offer.projekt.nazwa_projektu}</div>
      <div className="text-sm">Organizacja: {offer.organizacja.nazwa_organizacji}</div>
      <div className="text-sm">Status: {offer.czy_ukonczone ? 'Ukończone' : 'Otwarte'}</div>
      <div className="text-sm">Wolontariusz: {offer.wolontariusz ? offer.wolontariusz.username : 'Brak'}</div>
      <div className="mt-4 flex gap-2">
        <Button asChild>
          <Link to={`/organization/offers/${offer.id}/edit`}><Pencil /> Edytuj</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to={`/organization/offers`}><ArrowLeft /> Wróć</Link>
        </Button>
      </div>
    </div>
  );
}
