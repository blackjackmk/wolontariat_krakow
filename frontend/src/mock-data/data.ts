// To satisfy circular relations we create organizations first,
// then users that may reference them, and finally complete reverse links.

// --- Organizacje (Organizations) ---
export const mockOrganizacje: Organizacja[] = [
  {
    id: 1,
    nazwa_organizacji: 'Pomocna Dłoń',
    nip: '1234567890',
    weryfikacja: true,
    nr_telefonu: '111222333',
  },
  {
    id: 2,
    nazwa_organizacji: 'Serce dla Zwierząt',
    nip: '0987654321',
    weryfikacja: false,
    nr_telefonu: '222333444',
  },
];

// --- Uzytkownicy (Users) ---
export const mockUzytkownicy: Uzytkownik[] = [
  {
    id: 1,
    username: 'jan_wolontariusz',
    email: 'jan.kowalski@email.com',
    nr_telefonu: '123456789',
    rola: 'wolontariusz',
    organizacja: null,
  },
  {
    id: 2,
    username: 'anna_nowak',
    email: 'anna.nowak@email.com',
    nr_telefonu: '987654321',
    rola: 'wolontariusz',
    organizacja: null,
  },
  {
    id: 3,
    username: 'koordynator_adam',
    email: 'adam.koordynator@pomocna-dlpon.org',
    nr_telefonu: '555444333',
    rola: 'koordynator',
    organizacja: mockOrganizacje[0],
  },
  {
    id: 4,
    username: 'pomocna_dlon_org',
    email: 'kontakt@pomocna-dpon.org',
    nr_telefonu: '111222333',
    rola: 'organizacja',
    organizacja: mockOrganizacje[0],
  },
  {
    id: 5,
    username: 'serce_dla_zwierzat',
    email: 'kontakt@serce-dla-zwierzat.pl',
    nr_telefonu: '222333444',
    rola: 'organizacja',
    organizacja: mockOrganizacje[1],
  },
  {
    id: 6,
    username: 'ola_mloda',
    email: 'ola.mloda@example.com',
    nr_telefonu: '333222111',
    rola: 'wolontariusz',
    organizacja: null,
  },
  {
    id: 7,
    username: 'kuba_student',
    email: 'kuba.student@example.com',
    nr_telefonu: '444555666',
    rola: 'wolontariusz',
    organizacja: null,
  },
];

// complete reverse relations
mockOrganizacje[0].uzytkownicy = mockUzytkownicy.filter(u => u.organizacja?.id === 1);
mockOrganizacje[1].uzytkownicy = mockUzytkownicy.filter(u => u.organizacja?.id === 2);

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
    wolontariusz: mockUzytkownicy[0],
    czy_ukonczone: true,
    lokalizacja: 'Kraków',
    czas_trwania: 'Jednorazowe (1 dzień)',
    wymagania: ['chęci', 'dokładność'],
    temat: 'Pomoc społeczna',
    liczba_uczestnikow: 12,
    limit_uczestnikow: 15,
  },
  {
    id: 2,
    organizacja: mockOrganizacje[0],
    projekt: mockProjekty[1],
    tytul_oferty: 'Korepetytor z matematyki (szkoła podstawowa)',
    wolontariusz: null,
    czy_ukonczone: false,
    lokalizacja: 'Kraków',
    czas_trwania: '2-4h tygodniowo',
    wymagania: ['cierpliwość', 'podstawy matematyki'],
    temat: 'Edukacja',
    liczba_uczestnikow: 4,
    limit_uczestnikow: 8,
  },
  {
    id: 3,
    organizacja: mockOrganizacje[1],
    projekt: mockProjekty[2],
    tytul_oferty: 'Spacer z psami w schronisku - weekendy',
    wolontariusz: mockUzytkownicy[1],
    czy_ukonczone: false,
    lokalizacja: 'Wieliczka',
    czas_trwania: 'Weekendowo (3h)',
    wymagania: ['miłość do zwierząt'],
    temat: 'Zwierzęta',
    liczba_uczestnikow: 6,
    limit_uczestnikow: 10,
  },
  {
    id: 4,
    organizacja: mockOrganizacje[1],
    projekt: mockProjekty[2],
    tytul_oferty: 'Pomoc w transporcie zwierząt do weterynarza',
    wolontariusz: null,
    czy_ukonczone: false,
    lokalizacja: 'Kraków',
    czas_trwania: 'Dorywczo',
    wymagania: ['prawo jazdy', 'punktualność'],
    temat: 'Transport',
    liczba_uczestnikow: 2,
    limit_uczestnikow: 5,
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
