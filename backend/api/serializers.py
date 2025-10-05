from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from wolontariat_krakow.models import Projekt, Oferta, Uzytkownik, Organizacja, Recenzja

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
    wolontariusze = serializers.SerializerMethodField()
    liczba_uczestnikow = serializers.SerializerMethodField()

    class Meta:
        model = Oferta
        fields = [
            'id', 'organizacja', 'organizacja_nazwa', 'projekt', 'projekt_nazwa',
            'tytul_oferty', 'lokalizacja', 'data_wyslania', 'wolontariusz',
            'wolontariusz_info', 'wolontariusze', 'liczba_uczestnikow', 'czy_ukonczone'
        ]
        read_only_fields = ['organizacja', 'data_wyslania']

    # Helpers for multi-assignment via Zlecenie
    def get_wolontariusze(self, obj):
        from wolontariat_krakow.models import Uzytkownik
        qs = Uzytkownik.objects.filter(zlecenia__oferta=obj).distinct()
        return UzytkownikSerializer(qs, many=True).data

    def get_liczba_uczestnikow(self, obj):
        from wolontariat_krakow.models import Uzytkownik
        return Uzytkownik.objects.filter(zlecenia__oferta=obj).distinct().count()

class OfertaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Oferta
        fields = ['projekt', 'tytul_oferty', 'lokalizacja', 'data_wyslania']

    pass

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

class RecenzjaSerializer(serializers.ModelSerializer):
    organizacja = serializers.StringRelatedField(read_only=True)
    wolontariusz = serializers.StringRelatedField(read_only=True)
    oferta = serializers.PrimaryKeyRelatedField(queryset=Oferta.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Recenzja
        fields = ['id', 'organizacja', 'wolontariusz', 'oferta', 'ocena', 'komentarz', 'created_at']
        read_only_fields = ['id', 'organizacja', 'wolontariusz', 'created_at']

class RecenzjaCreateSerializer(serializers.ModelSerializer):
    oferta = serializers.PrimaryKeyRelatedField(queryset=Oferta.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Recenzja
        fields = ['oferta', 'ocena', 'komentarz']

    def validate_ocena(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError("Ocena musi być liczbą od 1 do 5.")
        return value

    def validate(self, data):
        request = self.context.get('request')
        user = request.user
        # must be organization
        if not user or getattr(user, 'rola', None) != 'organizacja':
            raise serializers.ValidationError("Tylko organizacje mogą wystawiać recenzje.")

        oferta = data.get('oferta', None)
        if oferta:
            # check oferta belongs to this org
            if oferta.organizacja != user.organizacja:
                raise serializers.ValidationError("Ta oferta nie należy do Twojej organizacji.")
            # check that offer is completed/approved
            if not oferta.czy_ukonczone:
                raise serializers.ValidationError("Można ocenić wolontariusza tylko po zakończeniu oferty.")
            # check that the volunteer is set on the offer
            if not oferta.wolontariusz:
                raise serializers.ValidationError("Nie ma przypisanego wolontariusza do tej oferty.")
            # prevent duplicate review for same oferta by same organization (if desired)
            if Recenzja.objects.filter(oferta=oferta, organizacja=user.organizacja).exists():
                raise serializers.ValidationError("Recenzja dla tej oferty już istnieje.")
            # set the wolontariusz field from oferta
            data['wolontariusz'] = oferta.wolontariusz
        else:
            # if no oferta provided, require wolontariusz id in context or explicit param?
            # For safety, enforce oferta must be provided
            raise serializers.ValidationError("Musisz podać 'oferta' aby ocenić wolontariusza.")
        return data

    def create(self, validated_data):
        request = self.context.get('request')
        org = request.user.organizacja
        validated_data['organizacja'] = org
        return super().create(validated_data)
