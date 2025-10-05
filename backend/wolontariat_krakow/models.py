from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.utils import timezone


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
# Pola username, email, password są brane z AbstractUser i nie są widoczne w modelu
class Uzytkownik(AbstractUser):
    telefon_validator = RegexValidator(regex=r'^\d{9}$', message="Numer telefonu musi składać się z dokładnie 9 cyfr.")

    email = models.EmailField(unique=True)

    nr_telefonu = models.CharField(
        max_length=9, validators=[telefon_validator],
        help_text="Podaj numer telefonu składający się tylko z 9 cyfr"
    )
    organizacja = models.ForeignKey(
        Organizacja, on_delete=models.SET_NULL, null=True, blank=True, related_name='uzytkownicy'
    )
    ROLE_TYPE = [
        ('wolontariusz', 'Wolontariusz'),
        ('koordynator', 'Koordynator'),
        ('organizacja', 'Organizacja'),
    ]
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
    lokalizacja = models.CharField(max_length=100)
    data_wyslania = models.DateTimeField(default=timezone.now())
    wolontariusz = models.ForeignKey(Uzytkownik, on_delete=models.SET_NULL, null=True, blank=True, related_name='oferty')
    czy_ukonczone = models.BooleanField(default=False)


    def __str__(self):
        return self.tytul_oferty


# ---Zlecenie---
class Zlecenie(models.Model):
    oferta = models.ForeignKey(Oferta, on_delete=models.CASCADE, related_name='zlecenia')
    wolontariusz = models.ManyToManyField(Uzytkownik, related_name='zlecenia', limit_choices_to={'rola': 'wolontariusz'})
    czy_ukonczone = models.BooleanField(default=False)
    czy_potwierdzone = models.BooleanField(default=False)

    def __str__(self):
        return f"Zlecenie: {self.oferta}"

# ---Wiadomosc---
class Wiadomosc(models.Model):
    nadawca = models.ForeignKey(Uzytkownik, on_delete=models.CASCADE, related_name='wyslane_wiadomosci')
    odbiorca = models.ForeignKey(Uzytkownik, on_delete=models.CASCADE, related_name='otrzymane_wiadomosci')
    tresc = models.TextField()
    data_wyslania = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Wiadomość od {self.nadawca} do {self.odbiorca}"

class Recenzja(models.Model):
    organizacja = models.ForeignKey('Organizacja', on_delete=models.CASCADE, related_name='recenzje')
    wolontariusz = models.ForeignKey('Uzytkownik', on_delete=models.CASCADE, related_name='recenzje')
    oferta = models.ForeignKey('Oferta', on_delete=models.SET_NULL, null=True, blank=True, related_name='recenzje')
    ocena = models.PositiveSmallIntegerField()
    komentarz = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('oferta', 'organizacja')

    def __str__(self):
        return f"Recenzja {self.ocena} — {self.wolontariusz} by {self.organizacja}"
