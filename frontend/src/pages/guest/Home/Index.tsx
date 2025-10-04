import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Home() {
  const gradient = (h: number) => ({ backgroundImage: `linear-gradient(135deg, hsl(${h} 85% 75%), hsl(${(h + 40) % 360} 90% 65%))` });

  return (
    <section className="space-y-10">
      {/* Hero */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            Krakowskie Cyfrowe Centrum Wolontariatu – Prototyp Aplikacji
          </h1>
          <p className="text-gray-700">
            Nowoczesna platforma łącząca młodych wolontariuszy, szkolnych koordynatorów i organizacje działające w Krakowie.
          </p>
          <div className="flex gap-3">
            <Button asChild>
              <Link to="/register">Zarejestruj się</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/volunteer/offers">Zobacz oferty</Link>
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Placeholder: tu pojawi się branding Młodego Krakowa i grafiki.
          </p>
        </div>
        <div className="h-56 md:h-72 rounded-xl" style={gradient(220)} />
      </div>

      {/* Cel */}
      <Card className="p-6 space-y-2">
        <h2 className="text-xl font-semibold">Cel</h2>
        <p className="text-gray-700">
          Stworzenie nowoczesnej platformy, która łączy młodych wolontariuszy, szkolnych koordynatorów wolontariatu z organizacjami i instytucjami
          działającymi na terenie Krakowa, ułatwiając dostęp do inicjatyw społecznych.
        </p>
      </Card>

      {/* Dlaczego to ważne */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-3">Dlaczego to ważne</h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li>Wolontariat rozwija młodzież, buduje społeczność i wspiera aktywne uczestnictwo w życiu miasta.</li>
          <li>Wiele inicjatyw nie dociera do potencjalnych wolontariuszy; organizacje mają trudności z rekrutacją i komunikacją.</li>
          <li>Brakuje jednego, spójnego miejsca online łączącego potrzeby organizacji z energią młodych ludzi.</li>
        </ul>
      </Card>

      {/* Użytkownicy aplikacji */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Użytkownicy aplikacji</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="h-24 rounded-lg mb-3" style={gradient(160)} />
            <h3 className="font-semibold">Wolontariusze</h3>
            <p className="text-sm text-gray-700">Młodzież ucząca się lub mieszkająca w Krakowie.</p>
          </Card>
          <Card className="p-4">
            <div className="h-24 rounded-lg mb-3" style={gradient(15)} />
            <h3 className="font-semibold">Organizacje i instytucje</h3>
            <p className="text-sm text-gray-700">NGO, szkoły, uczelnie, jednostki miejskie, instytucje kultury.</p>
          </Card>
          <Card className="p-4">
            <div className="h-24 rounded-lg mb-3" style={gradient(280)} />
            <h3 className="font-semibold">Szkolny koordynator wolontariatu</h3>
            <p className="text-sm text-gray-700">Organizacja wydarzeń dla uczniów, opieka nad grupami, kontakt z organizacją.</p>
          </Card>
        </div>
        <p className="text-xs text-gray-500">Kluczowa zasada: brak rywalizacji – stawiamy na współpracę.</p>
      </div>

      {/* Funkcjonalności aplikacji */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Funkcjonalności aplikacji</h2>
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Dla wolontariuszy</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
              <li>Przegląd i wyszukiwanie ofert.</li>
              <li>Konto wolontariusza (różnicowanie małoletni/pełnoletni).</li>
              <li>Zgłaszanie się jednym kliknięciem.</li>
              <li>Kontakt z organizacją (chat), kalendarz, powiadomienia.</li>
              <li>Generowanie zaświadczeń po zatwierdzeniu udziału.</li>
            </ul>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Dla organizacji</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
              <li>Publikacja ofert i zarządzanie zgłoszeniami.</li>
              <li>Komunikacja (chat, powiadomienia).</li>
              <li>Kalendarz i przypisywanie wolontariuszy do zadań.</li>
              <li>Raporty udziału i godzin pracy, zaświadczenia.</li>
              <li>Opinie i rekomendacje dla wolontariuszy.</li>
            </ul>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Dla koordynatora</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
              <li>Konto koordynatora szkolnego.</li>
              <li>Kontakt z organizacjami i przydzielanie uczniów.</li>
              <li>Kalendarz wydarzeń, powiadomienia.</li>
              <li>Zatwierdzanie i generowanie zaświadczeń.</li>
              <li>Generowanie raportów.</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Mapa inicjatyw - placeholder grafiki */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Mapa inicjatyw (placeholder)</h2>
        <div className="h-64 rounded-xl border bg-gray-50 flex items-center justify-center text-gray-500">
          Tu pojawi się interaktywna mapa
        </div>
      </div>

      {/* Dane testowe */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-2">Dane testowe</h2>
        <p className="text-gray-700 text-sm">
          Aplikacja działa na danych testowych – możesz swobodnie klikać i eksplorować funkcje bez prawdziwych danych.
        </p>
      </Card>

      {/* Efekt końcowy */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-3">Efekt końcowy</h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li>Łatwy i nowoczesny dostęp do wolontariatu dla młodzieży i organizacji.</li>
          <li>Uproszczona komunikacja i zarządzanie projektami.</li>
          <li>Większe zaangażowanie lokalnej społeczności.</li>
        </ul>
      </Card>

      {/* CTA */}
      <div className="rounded-xl border p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-lg font-semibold">Dołącz do inicjatywy</div>
          <div className="text-sm text-gray-600">Zarejestruj się i zacznij działać już dziś.</div>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link to="/register">Załóż konto</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/login">Zaloguj się</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
