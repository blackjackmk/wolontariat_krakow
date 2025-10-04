import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { mockOferty, mockProjekty } from '@/mock-data/data';

export default function Dashboard() {
  const { user } = useAuth();

  const orgId = user?.organizacja?.id;
  const orgOffers = useMemo(() => (orgId ? mockOferty.filter(o => o.organizacja.id === orgId) : mockOferty), [orgId]);
  const orgProjects = useMemo(() => (orgId ? mockProjekty.filter(p => p.organizacja.id === orgId) : mockProjekty), [orgId]);

  const role = user?.rola;

  // Volunteer metrics
  const myApplications = useMemo(() => {
    if (!user) return 0;
    return mockOferty.filter(o => (o.wolontariusz && o.wolontariusz.id === user.id)).length;
  }, [user]);
  const volunteerOpenOffers = useMemo(() => mockOferty.filter(o => !o.czy_ukonczone).length, []);
  const volunteerRecommended = useMemo(() => mockOferty.slice(0, 3), []);

  // Coordinator / Organization metrics
  const orgOpenOffers = useMemo(() => orgOffers.filter(o => !o.czy_ukonczone).length, [orgOffers]);
  const totalParticipants = useMemo(() => orgOffers.reduce((acc, o) => acc + (o.liczba_uczestnikow ?? (o.wolontariusz ? 1 : 0)), 0), [orgOffers]);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {role === 'wolontariusz' && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4"><div className="text-xs text-gray-500">Moje aplikacje</div><div className="text-2xl font-semibold">{myApplications}</div></Card>
            <Card className="p-4"><div className="text-xs text-gray-500">Otwarte oferty</div><div className="text-2xl font-semibold">{volunteerOpenOffers}</div></Card>
            <Card className="p-4"><div className="text-xs text-gray-500">Nadchodzące</div><div className="text-2xl font-semibold">—</div></Card>
            <Card className="p-4"><div className="text-xs text-gray-500">Godziny wolontariatu</div><div className="text-2xl font-semibold">—</div></Card>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Polecane dla Ciebie</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {volunteerRecommended.map(o => (
                <Card key={o.id} className="p-4">
                  <div className="font-medium">{o.tytul_oferty}</div>
                  <div className="text-xs text-gray-600">{o.organizacja.nazwa_organizacji}</div>
                  <a className="text-sm text-blue-600 hover:underline pt-2 inline-block" href={`/volunteer/offers/${o.id}`}>
                    Zobacz szczegóły
                  </a>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {role === 'koordynator' && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4"><div className="text-xs text-gray-500">Moje projekty</div><div className="text-2xl font-semibold">{orgProjects.length}</div></Card>
            <Card className="p-4"><div className="text-xs text-gray-500">Oferty organizacji</div><div className="text-2xl font-semibold">{orgOffers.length}</div></Card>
            <Card className="p-4"><div className="text-xs text-gray-500">Uczestnicy łącznie</div><div className="text-2xl font-semibold">{totalParticipants}</div></Card>
            <Card className="p-4"><div className="text-xs text-gray-500">Otwarte oferty</div><div className="text-2xl font-semibold">{orgOpenOffers}</div></Card>
          </div>
        </>
      )}

      {role === 'organizacja' && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4"><div className="text-xs text-gray-500">Projekty</div><div className="text-2xl font-semibold">{orgProjects.length}</div></Card>
            <Card className="p-4"><div className="text-xs text-gray-500">Oferty</div><div className="text-2xl font-semibold">{orgOffers.length}</div></Card>
            <Card className="p-4"><div className="text-xs text-gray-500">Otwarte oferty</div><div className="text-2xl font-semibold">{orgOpenOffers}</div></Card>
            <Card className="p-4"><div className="text-xs text-gray-500">Zweryfikowana</div><div className="text-2xl font-semibold">{user?.organizacja?.weryfikacja ? 'Tak' : 'Nie'}</div></Card>
          </div>
        </>
      )}
    </section>
  );
}
