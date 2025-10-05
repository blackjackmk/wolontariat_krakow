from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from wolontariat_krakow.models import Projekt, Oferta, Uzytkownik, Organizacja

class OrganizacjaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organizacja
        fields = ['id', 'nazwa_organizacji', 'nr_telefonu', 'nip', 'weryfikacja']

class UzytkownikSerializer(serializers.ModelSerializer):
    # Return nested organization object for reads
    organizacja = OrganizacjaSerializer(read_only=True)
    # Allow setting by ID where applicable (write-only alias)
    organizacja_id = serializers.PrimaryKeyRelatedField(
        source='organizacja', queryset=Organizacja.objects.all(), write_only=True, required=False
    )
    organizacja_nazwa = serializers.CharField(source='organizacja.nazwa_organizacji', read_only=True)

    class Meta:
        model = Uzytkownik
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'nr_telefonu', 'organizacja', 'organizacja_id', 'organizacja_nazwa', 'rola'
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

class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = Uzytkownik
        fields = ['username', 'email', 'password', 'password2', 'rola', 'nr_telefonu', 'first_name', 'last_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = Uzytkownik.objects.create_user(**validated_data)
        return user
