// --- RoleType ---
type RoleType = 'wolontariusz' | 'koordynator' | 'organizacja';

// --- Organizacja ---
type Organizacja = {
  id: number;
  nazwa_organizacji: string;
  nr_telefonu: string; // must be exactly 9 digits
  nip: string;
  weryfikacja: boolean;
  // related fields:
  uzytkownicy?: Uzytkownik[]; // reverse relation
  projekty?: Projekt[];
  oferty?: Oferta[];
};

// --- Uzytkownik ---
type Uzytkownik = {
  id: number;
  username: string;
  email: string;
  nr_telefonu: string; // must be exactly 9 digits
  organizacja?: Organizacja | null; // ForeignKey (nullable)
  rola: RoleType;
  // AbstractUser adds:
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  is_staff?: boolean;
  date_joined?: string; // ISO date string
  // related fields:
  oferty?: Oferta[];
  wyslane_wiadomosci?: Wiadomosc[];
  otrzymane_wiadomosci?: Wiadomosc[];
};

// --- Projekt ---
type Projekt = {
  id: number;
  organizacja: Organizacja; // Foreign key relation
  nazwa_projektu: string;
  opis_projektu: string;
  oferty?: Oferta[]; // reverse relation
};

// --- Oferta ---
type Oferta = {
  id: number;
  organizacja: Organizacja; // Foreign key relation
  projekt: Projekt; // Foreign key relation
  tytul_oferty: string;
  wolontariusz?: Uzytkownik | null; // Optional (nullable)
  czy_ukonczone: boolean;
};

// --- Wiadomosc ---
type Wiadomosc = {
  id: number;
  nadawca: Uzytkownik; // Foreign key relation
  odbiorca: Uzytkownik; // Foreign key relation
  tresc: string;
  data_wyslania: string; // ISO datetime string (auto_now_add)
};
