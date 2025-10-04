from wolontariat_krakow.models import Organizacja, Uzytkownik, Projekt, Oferta, Wiadomosc
from django.contrib.auth.hashers import make_password
from django.utils import timezone
import random
from datetime import timedelta

# --- Wyczyść istniejące dane ---
Wiadomosc.objects.all().delete()
Oferta.objects.all().delete()
Projekt.objects.all().delete()
Uzytkownik.objects.all().delete()
Organizacja.objects.all().delete()

# --- Organizacje ---
organizacje_dane = [
    ("Fundacja Serce dla Zwierząt", "501123456", "1234567890"),
    ("Stowarzyszenie Zielona Planeta", "502234567", "2345678901"),
    ("Fundacja Daj Szansę", "503345678", "3456789012"),
    ("Akcja Pomocy Dzieciom", "504456789", "4567890123"),
    ("Centrum Wolontariatu Polska", "505567890", "5678901234"),
]

organizacje = []
for nazwa, telefon, nip in organizacje_dane:
    organizacje.append(
        Organizacja.objects.create(
            nazwa_organizacji=nazwa,
            nr_telefonu=telefon,
            nip=nip
        )
    )

print("Dodano 5 organizacji")

# --- Użytkownicy ---
uzytkownicy_dane = [
    ("Jan Kowalski", "jan.kowalski@example.com", "wolontariusz"),
    ("Anna Nowak", "anna.nowak@example.com", "koordynator"),
    ("Piotr Zieliński", "piotr.zielinski@example.com", "organizacja"),
    ("Katarzyna Wiśniewska", "katarzyna.wisniewska@example.com", "wolontariusz"),
    ("Tomasz Lewandowski", "tomasz.lewandowski@example.com", "koordynator"),
]

uzytkownicy = []
for imie_nazwisko, email, rola in uzytkownicy_dane:
    uzytkownicy.append(
        Uzytkownik.objects.create(
            username=imie_nazwisko,
            email=email,
            nr_telefonu=str(random.randint(600000000, 699999999)),
            organizacja=random.choice(organizacje),
            rola=rola,
            password=make_password("haslo123")
        )
    )

print("Dodano 5 użytkowników")

# --- Projekty ---
projekty_dane = [
    "Pomoc zwierzętom w schronisku",
    "Warsztaty ekologiczne dla młodzieży",
    "Zbiórka żywności dla potrzebujących",
    "Sprzątanie terenów zielonych",
    "Wsparcie dla domów dziecka",
]

projekty = []
for nazwa in projekty_dane:
    projekty.append(
        Projekt.objects.create(
            organizacja=random.choice(organizacje),
            nazwa_projektu=nazwa,
            opis_projektu=f"Projekt '{nazwa}' realizowany przez wolontariuszy w całej Polsce."
        )
    )

print("Dodano 5 projektów")

# --- Oferty ---
oferty_dane = [
    ("Pomoc w schronisku", "Kraków, Azory"),
    ("Warsztaty ekologiczne", "Kraków, Balice"),
    ("Zbiórka żywności", "Kraków, Stary rynek"),
    ("Sprzątanie lasu", "Kraków"),
    ("Pomoc w domu dziecka", "Kraków"),
]

oferty = []
for tytul, lokalizacja in oferty_dane:
    losowa_data = timezone.now() - timedelta(days=random.randint(0, 10))
    oferty.append(
        Oferta.objects.create(
            organizacja=random.choice(organizacje),
            projekt=random.choice(projekty),
            tytul_oferty=tytul,
            lokalizacja=lokalizacja,
            data_wyslania=losowa_data,
            wolontariusz=random.choice(uzytkownicy),
            czy_ukonczone=random.choice([True, False])
        )
    )

print("Dodano 5 ofert")

# --- Wiadomości ---
wiadomosci_dane = [
    "Dzień dobry! Czy mogę dołączyć do projektu?",
    "Dziękuję za przesłane informacje o wydarzeniu.",
    "Czy potrzebne są jeszcze osoby do pomocy?",
    "Przesyłam raport z zakończonej akcji.",
    "Kiedy planowane jest kolejne spotkanie?",
]

for tresc in wiadomosci_dane:
    nadawca, odbiorca = random.sample(uzytkownicy, 2)
    Wiadomosc.objects.create(
        nadawca=nadawca,
        odbiorca=odbiorca,
        tresc=tresc
    )

print("Dodano 5 wiadomości")
print("Wszystkie dane testowe zostały pomyślnie utworzone!")
