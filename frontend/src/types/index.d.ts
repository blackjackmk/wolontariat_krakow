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
  wiek?: number; // age in years
  organizacja?: Organizacja | null; // ForeignKey (nullable)
  rola: RoleType;
  czy_maloletni?: boolean; // computed by backend
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
  wolontariusze?: Uzytkownik[]; // Multi-assignment via Zlecenie
  czy_ukonczone: boolean;
  // additional placeholder fields for UI/filters
  lokalizacja?: string;
  czas_trwania?: string; // e.g., "2-4h tygodniowo"
  wymagania?: string; // free text from backend
  tematyka?: string; // topic/category (backend field)
  liczba_uczestnikow?: number;
};

// --- Wiadomosc ---
type Wiadomosc = {
  id: number;
  nadawca: Uzytkownik; // Foreign key relation
  odbiorca: Uzytkownik; // Foreign key relation
  tresc: string;
  data_wyslania: string; // ISO datetime string (auto_now_add)
};

// --- Recenzja ---
type Recenzja = {
  id: number;
  organizacja: string; // StringRelatedField
  wolontariusz: string; // StringRelatedField or name
  oferta: number | null; // oferta id (nullable)
  ocena: number; // 1..5
  komentarz?: string;
  created_at: string; // ISO datetime
};
