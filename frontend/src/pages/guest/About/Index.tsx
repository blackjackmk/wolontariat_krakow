import React from 'react';
import { Heart, Users, Globe, ArrowRight } from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            O nas
          </h1>
          <p className="text-gray-700 leading-relaxed">
            Łączymy wolontariuszy, koordynatorów i organizacje, aby szybciej osiągać
            realny wpływ. Naszą misją jest uproszczenie współpracy i pomagać
            skupić się na tym, co najważniejsze: pomocy innym.
          </p>
          <div className="flex items-center gap-3">
            <a href="#misja" className="inline-flex items-center gap-2 text-primary hover:underline">
              Poznaj naszą misję <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
        <div>
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop"
            alt="Zespół współpracujący przy stole"
            className="w-full rounded-xl border shadow-md"
            loading="lazy"
          />
        </div>
      </section>

      {/* Features */}
      <section id="misja" className="grid gap-6 md:grid-cols-3">
        <FeatureCard
          icon={<Heart className="text-primary" />}
          title="Misja"
          description="Budujemy mosty między potrzebującymi a tymi, którzy chcą pomagać."
        />
        <FeatureCard
          icon={<Users className="text-primary" />}
          title="Społeczność"
          description="Tworzymy bezpieczną przestrzeń do współpracy i rozwoju."
        />
        <FeatureCard
          icon={<Globe className="text-primary" />}
          title="Zasięg"
          description="Docieramy do różnych środowisk i wspólnie skalujemy dobro."
        />
      </section>

      {/* Split section */}
      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop"
            alt="Wolontariusze w akcji"
            className="w-full rounded-xl border shadow-md"
            loading="lazy"
          />
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold">Jak działamy</h2>
          <p className="text-gray-700 leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer ut turpis a lorem
            bibendum accumsan. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
            posuere cubilia curae; Donec id nisi et justo tempor faucibus.
          </p>
          <ul className="grid gap-2 text-gray-700 list-disc pl-5">
            <li>Prosty proces zgłoszeń i koordynacji</li>
            <li>Przejrzysta komunikacja między stronami</li>
            <li>Wsparcie na każdym etapie</li>
          </ul>
        </div>
      </section>

      {/* Team */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Poznaj zespół</h2>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          <TeamCard name="Anna Kowalska" role="Prezes" avatar="https://i.pravatar.cc/120?img=47" />
          <TeamCard name="Jan Nowak" role="Zarząd" avatar="https://i.pravatar.cc/120?img=12" />
          <TeamCard name="Maria Wiśniewska" role="Wsparcie" avatar="https://i.pravatar.cc/120?img=32" />
        </div>
      </section>

      {/* Gallery */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Chwile z działań</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {['a','b','c','d','e','f'].map((seed) => (
            <img
              key={seed}
              src={`https://picsum.photos/seed/${seed}-galeria/600/420`}
              alt="Wolontariat — zdjęcie"
              className="w-full h-48 object-cover rounded-lg border shadow-sm"
              loading="lazy"
            />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-xl border bg-white shadow-sm p-6 md:p-8 text-center">
        <h2 className="text-2xl font-semibold">Dołącz do nas</h2>
        <p className="text-gray-700 mt-2">
          Chcesz zostać wolontariuszem, koordynatorem lub dołączyć jako organizacja?
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <a href="/register" className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2 text-white hover:bg-primary/90">
            Załóż konto
          </a>
          <a href="/login" className="inline-flex items-center justify-center rounded-md border px-5 py-2 hover:bg-accent">
            Zaloguj się
          </a>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <div className="font-medium">{title}</div>
          <p className="text-gray-700 text-sm mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}

function TeamCard({ name, role, avatar }: { name: string; role: string; avatar: string }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm flex items-center gap-4">
      <img src={avatar} alt={name} className="size-14 rounded-full object-cover border" loading="lazy" />
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-gray-600 text-sm">{role}</div>
      </div>
    </div>
  );
}
