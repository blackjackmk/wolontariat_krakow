from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator


# ---Organizacja---
class Organizacja(models.Model):
    telefon_validator = RegexValidator(
        regex=r'^\d{9}$',
        message="Numer telefonu musi składać się z dokładnie 9 cyfr."
    )

    nazwa_organizacji = models.CharField(max_length=100)
    nr_telefonu = models.CharField(max_length=9, validators=[telefon_validator], help_text="Podaj numer telefonu składający się tylko z 9 cyfr")
    nip = models.CharField(max_length=10, unique=True)
    weryfikacja = models.BooleanField(default=False)

    # Jeśli NIP nie jest null to organizacja zostaje pozytywnie zweryfikowana
    def save(self, *args, **kwargs):
        if self.nip:
            self.weryfikacja = True
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nazwa_organizacji


# ---Uzytkownik---
# Model użytkownika nie ma pola hasło, ponieważ sam AbstractUser posiada ukryte pole password i od razu je hashuje
class Uzytkownik(AbstractUser):
    telefon_validator = RegexValidator(
        regex=r'^\d{9}$',
        message="Numer telefonu musi składać się z dokładnie 9 cyfr."
    )

    ROLE_TYPE = [
        ('wolontariusz', 'Wolontariusz'),
        ('koordynator', 'Koordynator'),
        ('organizacja', 'Organizacja'),
    ]

    username = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    nr_telefonu = models.CharField(max_length=9, validators=[telefon_validator], help_text="Podaj numer telefonu składający się tylko z 9 cyfr")
    organizacja = models.ForeignKey(Organizacja, on_delete=models.SET_NULL, null=True, blank=True, related_name='uzytkownicy')
    rola = models.CharField(max_length=20, choices=ROLE_TYPE)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.username} ({self.rola})"


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
