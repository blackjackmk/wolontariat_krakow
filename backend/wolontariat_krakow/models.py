from django.db import models
from django.contrib.auth.models import AbstractUser


# ---Uzytkownik---
class Uzytkownik(AbstractUser):
    ROLE_TYPE = [
        ('wolontariusz', 'Wolontariusz'),
        ('koordynator', 'Koordynator'),
        ('organizacja', 'Organizacja'),
    ]

    imie = models.CharField(max_length=50)
    nazwisko = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    haslo = models.EmailField(max_length=20)
    nr_telefonu = models.CharField(max_length=9)
    nazwa_organizacji = models.CharField(max_length=100, blank=True, null=True)
    rola = models.CharField(max_length=20, choices=ROLE_TYPE)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['imie', 'nazwisko', 'haslo', 'email']

    def __str__(self):
        return f"{self.imie} {self.nazwisko} ({self.rola})"


# ---Organizacja---
class Organizacja(models.Model):
    nazwa_organizacji = models.CharField(max_length=100)
    nip = models.CharField(max_length=10, unique=True)
    weryfikacja = models.BooleanField(default=False)
    nr_telefonu = models.CharField(max_length=9)
    uzytkownik = models.OneToOneField(Uzytkownik, on_delete=models.CASCADE, related_name='organizacja')

    def __str__(self):
        return self.nazwa_organizacji


# ---Projekt---
class Projekt(models.Model):
    organizacja = models.ForeignKey(Organizacja, on_delete=models.CASCADE, related_name='projekty')
    nazwa_projektu = models.CharField(max_length=100)
    opis_projektu = models.TextField()

    def __str__(self):
        return self.nazwa_projektu


# ---Oferta---
class Oferta(models.Model):
    organizacja = models.ForeignKey(Organizacja, on_delete=models.CASCADE, related_name='oferty')
    projekt = models.ForeignKey(Projekt, on_delete=models.CASCADE, related_name='oferty')
    tytul_oferty = models.CharField(max_length=100)
    wolontariusz = models.ForeignKey(Uzytkownik, on_delete=models.SET_NULL, null=True, blank=True, related_name='oferty')
    czy_ukonczone = models.BooleanField(default=False)

    def __str__(self):
        return self.tytul_oferty


# ---Wiadomosc---
class Wiadomosc(models.Model):
    nadawca = models.ForeignKey(Uzytkownik, on_delete=models.CASCADE, related_name='wyslane_wiadomosci')
    odbiorca = models.ForeignKey(Uzytkownik, on_delete=models.CASCADE, related_name='otrzymane_wiadomosci')
    tresc = models.TextField()
    data_wyslania = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Wiadomość od {self.nadawca} do {self.odbiorca}"
