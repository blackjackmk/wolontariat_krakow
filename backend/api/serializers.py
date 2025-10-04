from rest_framework import serializers
from wolontariat_krakow.models import Uzytkownik, Organizacja, Projekt, Oferta, Wiadomosc


class UzytkownikSerializer(serializers.ModelSerializer):
    class Meta:
        model = Uzytkownik
        fields = ['id', 'imie', 'nazwisko', 'email', 'nr_telefonu', 'nazwa_organizacji', 'rola']
        extra_kwargs = {'haslo': {'write_only': True}}

class OrganizacjaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organizacja
        fields = '__all__'

class ProjektSerializer(serializers.ModelSerializer):
    class Meta:
        model = Projekt
        fields = '__all__'

class OfertaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Oferta
        fields = '__all__'

class WiadomoscSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wiadomosc
        fields = '__all__'
