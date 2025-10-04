// --- Uzytkownik ---
type RoleType = 'wolontariusz' | 'koordynator' | 'organizacja';

type Uzytkownik = {
  id: number;
  username: string
  email: string;
  haslo: string;
  nr_telefonu: string;
  nazwa_organizacji?: string | null;
  rola: RoleType;
};

// --- Organizacja ---
type Organizacja = {
  id: number;
  nazwa_organizacji: string;
  nip: string;
  weryfikacja: boolean;
  nr_telefonu: string;
  uzytkownik: Uzytkownik; // One-to-One relation
};

// --- Projekt ---
type Projekt = {
  id: number;
  organizacja: Organizacja; // Foreign key relation
  nazwa_projektu: string;
  opis_projektu: string;
};

// --- Oferta ---
type Oferta = {
  id: number;
  organizacja: Organizacja; // Foreign key relation
  projekt: Projekt;           // Foreign key relation
  tytul_oferty: string;
  wolontariusz?: Uzytkownik | null; // Optional, can be null
  czy_ukonczone: boolean;
};

// --- Wiadomosc ---
type Wiadomosc = {
  id: number;
  nadawca: Uzytkownik;   // Foreign key relation
  odbiorca: Uzytkownik;  // Foreign key relation
  tresc: string;
  data_wyslania: string; // ISO date string
};
