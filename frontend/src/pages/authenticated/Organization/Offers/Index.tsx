import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getOffers } from '@/api/offers';
import { getProjects } from '@/api/projects';
import { getUsers } from '@/api/users';
import { Link } from 'react-router-dom';
import { mockOferty } from '@/mock-data/data';

export default function OrganizationOffersListPage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Oferta[]>([]);
  const [projects, setProjects] = useState<Projekt[]>([]);
  const [volunteers, setVolunteers] = useState<Uzytkownik[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOffers(), getProjects(), getUsers()]).then(([o, p, u]) => {
      setOffers(o);
      setProjects(p);
      setVolunteers(u.filter(x => x.rola === 'wolontariusz'));
      setLoading(false);
    });
  }, []);

  const ownProjects = useMemo(() => {
    if (!user?.organizacja) return projects;
    return projects.filter(p => p.organizacja.id === user.organizacja!.id);
  }, [projects, user]);

  const ownOffers = useMemo(() => {
    if (!user?.organizacja) return offers;
    return offers.filter(o => o.organizacja.id === user.organizacja!.id);
  }, [offers, user]);

  if (loading) return <div>Ładowanie…</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Oferty Organizacji</h1>

      <div className="mb-4">
        <Link className="inline-block px-3 py-2 rounded border" to="/organization/offers/create">Dodaj nową ofertę</Link>
      </div>

      <ul className="space-y-3">
        {ownOffers.map(o => (
          <li key={o.id} className="rounded border bg-white p-4">
            <div className="font-medium">{o.tytul_oferty}</div>
            <div className="text-sm text-gray-600">Projekt: {o.projekt.nazwa_projektu}</div>
            <div className="text-sm">Status: {o.czy_ukonczone ? 'Ukończone' : 'Otwarte'}</div>
            <div className="text-sm">Wolontariusz: {o.wolontariusz ? o.wolontariusz.username : 'Brak'}</div>
            <div className="mt-2 flex gap-2">
              <Link className="px-3 py-1 text-sm rounded border" to={`/organization/offers/${o.id}`}>Pokaż</Link>
              <Link className="px-3 py-1 text-sm rounded border" to={`/organization/offers/${o.id}/edit`}>Edytuj</Link>
              <button className="px-3 py-1 text-sm rounded border text-red-600 border-red-300" onClick={() => {
                setOffers(prev => prev.filter(x => x.id !== o.id));
                const idx = mockOferty.findIndex(x => x.id === o.id);
                if (idx >= 0) mockOferty.splice(idx, 1);
              }}>Usuń</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
