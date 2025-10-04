from rest_framework import viewsets
from wolontariat_krakow.models import Uzytkownik, Organizacja, Projekt, Oferta, Wiadomosc
from .serializers import (
    UzytkownikSerializer, 
    OrganizacjaSerializer, 
    ProjektSerializer,
    OfertaSerializer, 
    WiadomoscSerializer
)

class UzytkownikViewSet(viewsets.ModelViewSet):
    queryset = Uzytkownik.objects.all().order_by('-id')
    serializer_class = UzytkownikSerializer

class OrganizacjaViewSet(viewsets.ModelViewSet):
    queryset = Organizacja.objects.all().order_by('-id')
    serializer_class = OrganizacjaSerializer

class ProjektViewSet(viewsets.ModelViewSet):
    queryset = Projekt.objects.all().order_by('-id')
    serializer_class = ProjektSerializer

class OfertaViewSet(viewsets.ModelViewSet):
    queryset = Oferta.objects.all().order_by('-id')
    serializer_class = OfertaSerializer

class WiadomoscViewSet(viewsets.ModelViewSet):
    queryset = Wiadomosc.objects.all().order_by('-id')
    serializer_class = WiadomoscSerializer
