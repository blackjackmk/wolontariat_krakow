from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.db.models import Q
from wolontariat_krakow.models import Projekt, Oferta, Uzytkownik, Organizacja
from .serializers import (
    ProjektSerializer, OfertaSerializer, OfertaCreateSerializer,
    UzytkownikSerializer, OrganizacjaSerializer
)

class ProjektViewSet(viewsets.ModelViewSet):
    serializer_class = ProjektSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Projekt.objects.all()

        # Filter by organization
        organizacja_id = self.request.query_params.get('organizacja')
        if organizacja_id:
            queryset = queryset.filter(organizacja_id=organizacja_id)

        # Search in project name or description
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(nazwa_projektu__icontains=search) |
                Q(opis_projektu__icontains=search)
            )

        return queryset

    def perform_create(self, serializer):
        if self.request.user.rola not in ['organizacja', 'koordynator']:
            raise PermissionError('Only organizations and coordinators can create projects')

        if self.request.user.rola == 'organizacja' and self.request.user.organizacja:
            serializer.save(organizacja=self.request.user.organizacja)
        else:
            serializer.save()

    @action(detail=True, methods=['get'])
    def oferty(self, request, pk=None):
        """Get all offers for a specific project"""
        project = self.get_object()
        offers = project.oferty.all()
        serializer = OfertaSerializer(offers, many=True)
        return Response(serializer.data)

class OfertaViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Oferta.objects.all()

        projekt_id = self.request.query_params.get('projekt')
        if projekt_id:
            queryset = queryset.filter(projekt_id=projekt_id)

        organizacja_id = self.request.query_params.get('organizacja')
        if organizacja_id:
            queryset = queryset.filter(organizacja_id=organizacja_id)

        lokalizacja = self.request.query_params.get('lokalizacja')
        if lokalizacja:
            queryset = queryset.filter(lokalizacja__icontains=lokalizacja)

        tylko_wolne = self.request.query_params.get('tylko_wolne')
        if tylko_wolne and tylko_wolne.lower() == 'true':
            queryset = queryset.filter(wolontariusz__isnull=True)

        completed = self.request.query_params.get('completed')
        if completed and completed.lower() == 'true':
            queryset = queryset.filter(czy_ukonczone=True)
        else:
            queryset = queryset.filter(czy_ukonczone=False)

        return queryset

    def get_serializer_class(self):
        if self.action == 'create':
            return OfertaCreateSerializer
        return OfertaSerializer

    def perform_create(self, serializer):
        if self.request.user.rola not in ['organizacja', 'koordynator']:
            raise PermissionError('Only organizations and coordinators can create offers')

        if self.request.user.rola == 'organizacja' and self.request.user.organizacja:
            serializer.save(organizacja=self.request.user.organizacja)
        else:
            serializer.save()

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def apply(self, request, pk=None):
        """Apply for an offer (volunteers only)"""
        offer = self.get_object()

        if request.user.rola != 'wolontariusz':
            return Response(
                {'error': 'Only volunteers can apply for offers'},
                status=status.HTTP_403_FORBIDDEN
            )

        if offer.czy_ukonczone:
            return Response(
                {'error': 'This offer is already completed'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if offer.wolontariusz:
            return Response(
                {'error': 'This offer already has a volunteer'},
                status=status.HTTP_400_BAD_REQUEST
            )

        offer.wolontariusz = request.user
        offer.save()

        serializer = OfertaSerializer(offer)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def approve(self, request, pk=None):
        """Approve a volunteer for an offer (organization/coordinator only)"""
        offer = self.get_object()

        if request.user.rola not in ['organizacja', 'koordynator']:
            return Response(
                {'error': 'Only organizations and coordinators can approve volunteers'},
                status=status.HTTP_403_FORBIDDEN
            )

        if request.user.rola == 'organizacja' and offer.organizacja != request.user.organizacja:
            return Response(
                {'error': 'You can only approve volunteers for your organization offers'},
                status=status.HTTP_403_FORBIDDEN
            )

        if not offer.wolontariusz:
            return Response(
                {'error': 'No volunteer to approve for this offer'},
                status=status.HTTP_400_BAD_REQUEST
            )

        offer.czy_ukonczone = True
        offer.save()

        serializer = OfertaSerializer(offer)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_offers(self, request):
        """Get offers related to current user"""
        if request.user.rola == 'wolontariusz':
            offers = Oferta.objects.filter(wolontariusz=request.user)
        elif request.user.rola == 'organizacja' and request.user.organizacja:
            offers = Oferta.objects.filter(organizacja=request.user.organizacja)
        else:
            offers = Oferta.objects.none()

        serializer = OfertaSerializer(offers, many=True)
        return Response(serializer.data)

class UzytkownikViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UzytkownikSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.rola in ['organizacja', 'koordynator']:
            return Uzytkownik.objects.filter(rola='wolontariusz')
        return Uzytkownik.objects.filter(id=self.request.user.id)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile"""
        serializer = UzytkownikSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def volunteers(self, request):
        """Get all volunteers (for organizations/coordinators)"""
        if request.user.rola not in ['organizacja', 'koordynator']:
            return Response(
                {'error': 'Only organizations and coordinators can view all volunteers'},
                status=status.HTTP_403_FORBIDDEN
            )

        volunteers = Uzytkownik.objects.filter(rola='wolontariusz')
        serializer = UzytkownikSerializer(volunteers, many=True)
        return Response(serializer.data)

class OrganizacjaViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrganizacjaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = Organizacja.objects.filter(weryfikacja=True)

    @action(detail=True, methods=['get'])
    def projekty(self, request, pk=None):
        """Get all projects for a specific organization"""
        organization = self.get_object()
        projects = organization.projekty.all()
        serializer = ProjektSerializer(projects, many=True)
        return Response(serializer.data)
