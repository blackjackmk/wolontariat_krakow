import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ListChecks } from 'lucide-react';

export default function Profile() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Profil</h1>
      <p className="text-gray-700">Zarządzaj swoim kontem i przeglądaj zgłoszone oferty.</p>
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
