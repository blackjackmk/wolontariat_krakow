import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ListChecks } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Profile() {
  const { user } = useAuth();
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Profil</h1>
      <p className="text-gray-700">Zarządzaj swoim kontem i przeglądaj zgłoszone oferty.</p>
      {user?.rola === 'wolontariusz' && (
        <div className="inline-flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Status:</span>
          <span className={`px-2 py-0.5 rounded-full border ${user?.czy_maloletni ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 'bg-emerald-50 border-emerald-300 text-emerald-700'}`}>
            {user?.czy_maloletni ? 'Małoletni' : 'Pełnoletni'}
            {typeof user?.wiek === 'number' ? ` (${user?.wiek} lat)` : ''}
          </span>
        </div>
      )}
      <div>
        <Button asChild variant="outline">
          <Link to="/volunteer/applied-offers">
            <ListChecks /> Zgłoszone oferty
          </Link>
        </Button>
      </div>
    </section>
  );
}
