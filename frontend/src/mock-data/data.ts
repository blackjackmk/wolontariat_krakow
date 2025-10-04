// --- Uzytkownicy (Users) ---
export const mockUzytkownicy: Uzytkownik[] = [
  {
    id: 1,
    username: 'jan_wolontariusz',
    email: 'jan.kowalski@email.com',
    haslo: 'hashed_password_123',
    nr_telefonu: '123-456-789',
    rola: 'wolontariusz',
  },
  {
    id: 2,
    username: 'anna_nowak',
    email: 'anna.nowak@email.com',
    haslo: 'hashed_password_456',
    nr_telefonu: '987-654-321',
    rola: 'wolontariusz',
  },
  {
    id: 3,
    username: 'koordynator_adam',
    email: 'adam.koordynator@pomocna-dlpon.org',
    haslo: 'hashed_password_789',
    nr_telefonu: '555-444-333',
    nazwa_organizacji: 'Pomocna Dłoń',
    rola: 'koordynator',
  },
  {
    id: 4,
    username: 'pomocna_dlon_org',
    email: 'kontakt@pomocna-dpon.org',
    haslo: 'hashed_password_org1',
    nr_telefonu: '111-222-333',
    nazwa_organizacji: 'Pomocna Dłoń',
    rola: 'organizacja',
  },
  {
    id: 5,
    username: 'serce_dla_zwierzat',
    email: 'kontakt@serce-dla-zwierzat.pl',
    haslo: 'hashed_password_org2',
    nr_telefonu: '222-333-444',
    nazwa_organizacji: 'Serce dla Zwierząt',
    rola: 'organizacja',
  },
];

// --- Organizacje (Organizations) ---
export const mockOrganizacje: Organizacja[] = [
  {
    id: 1,
    nazwa_organizacji: 'Pomocna Dłoń',
    nip: '1234567890',
    weryfikacja: true,
    nr_telefonu: '111-222-333',
    uzytkownik: mockUzytkownicy[3], // Relacja do uzytkownik 'pomocna_dlon_org'
  },
  {
    id: 2,
    nazwa_organizacji: 'Serce dla Zwierząt',
    nip: '0987654321',
    weryfikacja: false,
    nr_telefonu: '222-333-444',
    uzytkownik: mockUzytkownicy[4], // Relacja do uzytkownik 'serce_dla_zwierzat'
  },
];

// --- Projekty (Projects) ---
export const mockProjekty: Projekt[] = [
  {
    id: 1,
    organizacja: mockOrganizacje[0],
    nazwa_projektu: 'Zbiórka żywności na zimę',
    opis_projektu: 'Celem projektu jest zebranie długoterminowej żywności dla osób potrzebujących przed nadejściem zimy.',
  },
  {
    id: 2,
    organizacja: mockOrganizacje[0],
    nazwa_projektu: 'Korepetycje dla dzieci',
    opis_projektu: 'Pomoc w nauce dla dzieci z rodzin w trudnej sytuacji materialnej.',
  },
  {
    id: 3,
    organizacja: mockOrganizacje[1],
    nazwa_projektu: 'Adopcja bezdomnych psów',
    opis_projektu: 'Znajdowanie nowych, kochających domów dla psów ze schroniska.',
  },
];

// --- Oferty (Offers) ---
export const mockOferty: Oferta[] = [
  {
    id: 1,
    organizacja: mockOrganizacje[0],
    projekt: mockProjekty[0],
    tytul_oferty: 'Pomoc przy sortowaniu darów - 10.12.2025',
    wolontariusz: mockUzytkownicy[0], // Jan Wolontariusz
    czy_ukonczone: true,
  },
  {
    id: 2,
    organizacja: mockOrganizacje[0],
    projekt: mockProjekty[1],
    tytul_oferty: 'Korepetytor z matematyki (szkoła podstawowa)',
    wolontariusz: null,
    czy_ukonczone: false,
  },
  {
    id: 3,
    organizacja: mockOrganizacje[1],
    projekt: mockProjekty[2],
    tytul_oferty: 'Spacer z psami w schronisku - weekendy',
    wolontariusz: mockUzytkownicy[1], // Anna Nowak
    czy_ukonczone: false,
  },
  {
    id: 4,
    organizacja: mockOrganizacje[1],
    projekt: mockProjekty[2],
    tytul_oferty: 'Pomoc w transporcie zwierząt do weterynarza',
    wolontariusz: null,
    czy_ukonczone: false,
  },
];

// --- Wiadomosci (Messages) ---
export const mockWiadomosci: Wiadomosc[] = [
  {
    id: 1,
    nadawca: mockUzytkownicy[0],   // Jan Wolontariusz
    odbiorca: mockUzytkownicy[2],  // Koordynator Adam
    tresc: 'Dzień dobry, chciałbym zapytać o szczegóły dotyczące oferty korepetycji. Czy są jakieś konkretne wymagania?',
    data_wyslania: '2025-10-20T10:00:00Z',
  },
  {
    id: 2,
    nadawca: mockUzytkownicy[2],  // Koordynator Adam
    odbiorca: mockUzytkownicy[0],   // Jan Wolontariusz
    tresc: 'Witaj Janie, dziękuję za zainteresowanie. Najważniejsza jest chęć pomocy i podstawowa wiedza z matematyki na poziomie szkoły podstawowej. Daj znać, czy jesteś zainteresowany.',
    data_wyslania: '2025-10-20T10:15:00Z',
  },
  {
    id: 3,
    nadawca: mockUzytkownicy[1],   // Anna Nowak
    odbiorca: mockUzytkownicy[4],  // Serce dla Zwierząt
    tresc: 'Cześć, potwierdzam swoją obecność na spacerze z psami w najbliższą sobotę.',
    data_wyslania: '2025-10-21T14:30:00Z',
  },
];