import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { getProjects } from '@/api/projects';
import { getOffers } from '@/api/offers';

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Projekt[]>([]);
  const [offers, setOffers] = useState<Oferta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProjects(), getOffers()]).then(([ps, os]) => {
      setProjects(ps);
      setOffers(os);
      setLoading(false);
    });
  }, []);

  const orgId = user?.organizacja?.id;
  const orgOffers = useMemo(() => (orgId ? offers.filter(o => o.organizacja.id === orgId) : offers), [offers, orgId]);
  const orgProjects = useMemo(() => (orgId ? projects.filter(p => p.organizacja.id === orgId) : projects), [projects, orgId]);

  const role = user?.rola;

  // Volunteer metrics
  const myApplications = useMemo(() => {
    if (!user) return 0;
    return offers.filter(o => (o.wolontariusz && o.wolontariusz.id === user.id)).length;
  }, [user, offers]);
  const volunteerOpenOffers = useMemo(() => offers.filter(o => !o.czy_ukonczone).length, [offers]);
  const volunteerRecommended = useMemo(() => offers.slice(0, 3), [offers]);

  // Coordinator / Organization metrics
  const orgOpenOffers = useMemo(() => orgOffers.filter(o => !o.czy_ukonczone).length, [orgOffers]);
  const totalParticipants = useMemo(() => orgOffers.reduce((acc, o) => acc + (o.liczba_uczestnikow ?? (o.wolontariusz ? 1 : 0)), 0), [orgOffers]);

  if (loading) return <div>Ładowanie…</div>;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {role === 'wolontariusz' && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-primary/10 border-primary/20"><div className="text-xs text-primary">Moje aplikacje</div><div className="text-2xl font-semibold text-primary">{myApplications}</div></Card>
            <Card className="p-4 bg-secondary/10 border-secondary/20"><div className="text-xs text-secondary">Otwarte oferty</div><div className="text-2xl font-semibold text-secondary">{volunteerOpenOffers}</div></Card>
            <Card className="p-4 bg-accent/10 border-accent/20"><div className="text-xs text-accent">Nadchodzące</div><div className="text-2xl font-semibold text-accent">—</div></Card>
            <Card className="p-4 bg-destructive/10 border-destructive/20"><div className="text-xs text-destructive">Godziny wolontariatu</div><div className="text-2xl font-semibold text-destructive">—</div></Card>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Polecane dla Ciebie</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {volunteerRecommended.map(o => (
                <Card key={o.id} className="p-4 border-primary/20">
                  <div className="font-medium">{o.tytul_oferty}</div>
                  <div className="text-xs text-primary">{o.organizacja.nazwa_organizacji}</div>
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
            <Card className="p-4 bg-primary/10 border-primary/20"><div className="text-xs text-primary">Moje projekty</div><div className="text-2xl font-semibold text-primary">{orgProjects.length}</div></Card>
            <Card className="p-4 bg-secondary/10 border-secondary/20"><div className="text-xs text-secondary">Oferty organizacji</div><div className="text-2xl font-semibold text-secondary">{orgOffers.length}</div></Card>
            <Card className="p-4 bg-accent/10 border-accent/20"><div className="text-xs text-accent">Uczestnicy łącznie</div><div className="text-2xl font-semibold text-accent">{totalParticipants}</div></Card>
            <Card className="p-4 bg-destructive/10 border-destructive/20"><div className="text-xs text-destructive">Otwarte oferty</div><div className="text-2xl font-semibold text-destructive">{orgOpenOffers}</div></Card>
          </div>
        </>
      )}

      {role === 'organizacja' && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-primary/10 border-primary/20"><div className="text-xs text-primary">Projekty</div><div className="text-2xl font-semibold text-primary">{orgProjects.length}</div></Card>
            <Card className="p-4 bg-secondary/10 border-secondary/20"><div className="text-xs text-secondary">Oferty</div><div className="text-2xl font-semibold text-secondary">{orgOffers.length}</div></Card>
            <Card className="p-4 bg-accent/10 border-accent/20"><div className="text-xs text-accent">Otwarte oferty</div><div className="text-2xl font-semibold text-accent">{orgOpenOffers}</div></Card>
            <Card className="p-4 bg-destructive/10 border-destructive/20"><div className="text-xs text-destructive">Zweryfikowana</div><div className="text-2xl font-semibold text-destructive">{user?.organizacja?.weryfikacja ? 'Tak' : 'Nie'}</div></Card>
          </div>
        </>
      )}
    </section>
  );
}
