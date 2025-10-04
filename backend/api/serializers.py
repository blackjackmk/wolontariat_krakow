from rest_framework import serializers
from wolontariat_krakow.models import Projekt, Oferta, Uzytkownik, Organizacja

class OrganizacjaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organizacja
        fields = ['id', 'nazwa_organizacji', 'nr_telefonu', 'nip', 'weryfikacja']

class UzytkownikSerializer(serializers.ModelSerializer):
    organizacja_nazwa = serializers.CharField(source='organizacja.nazwa_organizacji', read_only=True)

    class Meta:
        model = Uzytkownik
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'nr_telefonu', 'organizacja', 'organizacja_nazwa', 'rola'
        ]
        read_only_fields = ['id', 'username', 'email']

class ProjektSerializer(serializers.ModelSerializer):
    organizacja_nazwa = serializers.CharField(source='organizacja.nazwa_organizacji', read_only=True)
    oferty_count = serializers.IntegerField(source='oferty.count', read_only=True)

    class Meta:
        model = Projekt
        fields = [
            'id', 'organizacja', 'organizacja_nazwa', 'nazwa_projektu',
            'opis_projektu', 'oferty_count'
        ]

class OfertaSerializer(serializers.ModelSerializer):
    projekt_nazwa = serializers.CharField(source='projekt.nazwa_projektu', read_only=True)
    organizacja_nazwa = serializers.CharField(source='organizacja.nazwa_organizacji', read_only=True)
    wolontariusz_info = UzytkownikSerializer(source='wolontariusz', read_only=True)

    class Meta:
        model = Oferta
        fields = [
            'id', 'organizacja', 'organizacja_nazwa', 'projekt', 'projekt_nazwa',
            'tytul_oferty', 'lokalizacja', 'data_wyslania', 'wolontariusz',
            'wolontariusz_info', 'czy_ukonczone'
        ]
        read_only_fields = ['organizacja', 'data_wyslania']

class OfertaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Oferta
        fields = ['projekt', 'tytul_oferty', 'lokalizacja', 'data_wyslania']
