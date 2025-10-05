from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.auth import authenticate
from wolontariat_krakow.models import Projekt, Oferta, Uzytkownik, Organizacja, Recenzja
from .serializers import (
    ProjektSerializer, OfertaSerializer, OfertaCreateSerializer,
    UzytkownikSerializer, OrganizacjaSerializer,
    RecenzjaSerializer, RecenzjaCreateSerializer
)
from .permissions import IsOrganization, IsOwnerOrReadOnly

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
            # Only offers with no assigned volunteers via Zlecenie
            queryset = queryset.filter(~Q(zlecenia__wolontariusz__isnull=False))

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

        # Add user to Zlecenie (create if needed)
        from wolontariat_krakow.models import Zlecenie
        zlecenie, _ = Zlecenie.objects.get_or_create(oferta=offer)
        if zlecenie.wolontariusz.filter(id=request.user.id).exists():
            return Response({'message': 'Already applied'}, status=status.HTTP_200_OK)
        zlecenie.wolontariusz.add(request.user)

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

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def assign(self, request, pk=None):
        """Assign a volunteer to an offer (organization/coordinator only)"""
        offer = self.get_object()

        if request.user.rola not in ['organizacja', 'koordynator']:
            return Response(
                {'error': 'Only organizations and coordinators can assign volunteers'},
                status=status.HTTP_403_FORBIDDEN
            )

        if request.user.rola == 'organizacja' and offer.organizacja != request.user.organizacja:
            return Response(
                {'error': 'You can only assign volunteers for your organization offers'},
                status=status.HTTP_403_FORBIDDEN
            )

        wolontariusz_id = request.data.get('wolontariusz_id')
        if not wolontariusz_id:
            return Response({'error': 'wolontariusz_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = Uzytkownik.objects.get(id=wolontariusz_id, rola='wolontariusz')
        except Uzytkownik.DoesNotExist:
            return Response({'error': 'Volunteer not found'}, status=status.HTTP_404_NOT_FOUND)

        from wolontariat_krakow.models import Zlecenie
        zlecenie, _ = Zlecenie.objects.get_or_create(oferta=offer)
        zlecenie.wolontariusz.add(user)

        serializer = OfertaSerializer(offer)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def withdraw(self, request, pk=None):
        """Withdraw application from an offer (volunteer only)"""
        offer = self.get_object()

        if request.user.rola != 'wolontariusz':
            return Response({'error': 'Only volunteers can withdraw'}, status=status.HTTP_403_FORBIDDEN)

        from wolontariat_krakow.models import Zlecenie
        qs = offer.zlecenia.filter(wolontariusz=request.user)
        if not qs.exists():
            return Response({'error': 'You are not assigned to this offer'}, status=status.HTTP_400_BAD_REQUEST)
        for z in qs:
            z.wolontariusz.remove(request.user)
        offer.czy_ukonczone = False
        offer.save(update_fields=['czy_ukonczone'])

        serializer = OfertaSerializer(offer)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_offers(self, request):
        """Get offers related to current user"""
        if request.user.rola == 'wolontariusz':
            offers = Oferta.objects.filter(zlecenia__wolontariusz=request.user).distinct()
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

class RecenzjaViewSet(viewsets.ModelViewSet):
    """
    create: organization posts a review for a volunteer (via oferta)
    list: public list (or restricted) — we'll allow read for any, write only for org
    update/destroy: only the org that created the review may change it
    """
    queryset = Recenzja.objects.select_related('organizacja', 'wolontariusz', 'oferta').all()
    permission_classes = [IsAuthenticatedOrReadOnly := __import__('rest_framework.permissions').permissions.IsAuthenticatedOrReadOnly]  # lazy import to avoid extra top import

    def get_permissions(self):
        if self.action in ['create']:
            return [IsAuthenticated(), IsOrganization()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsOwnerOrReadOnly()]
        return [AllowAny()]

    def get_serializer_class(self):
        if self.action == 'create':
            return RecenzjaCreateSerializer
        return RecenzjaSerializer

    # optionally restrict list to volunteers' profile or pagination/filtering
    def get_queryset(self):
        qs = super().get_queryset()
        # Allow filtering by wolontariusz id via ?wolontariusz=123
        wol_id = self.request.query_params.get('wolontariusz')
        if wol_id:
            qs = qs.filter(wolontariusz__id=wol_id)
        return qs

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    User registration endpoint
    """
    required_fields = ['username', 'email', 'password', 'rola', 'nr_telefonu']

    for field in required_fields:
        if field not in request.data:
            return Response(
                {'error': f'Missing required field: {field}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    if Uzytkownik.objects.filter(username=request.data['username']).exists():
        return Response(
            {'error': 'Username already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if Uzytkownik.objects.filter(email=request.data['email']).exists():
        return Response(
            {'error': 'Email already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = Uzytkownik.objects.create_user(
            username=request.data['username'],
            email=request.data['email'],
            password=request.data['password'],
            rola=request.data['rola'],
            nr_telefonu=request.data['nr_telefonu'],
            first_name=request.data.get('first_name', ''),
            last_name=request.data.get('last_name', ''),
        )

        # Optionally attach organization for organization/coordinator accounts
        if 'organizacja_id' in request.data and request.data['rola'] in ['organizacja', 'koordynator']:
            user.organizacja_id = request.data['organizacja_id']
            user.save()

        token, created = Token.objects.get_or_create(user=user)

        return Response({
            'user': UzytkownikSerializer(user).data,
            'token': token.key,
            'message': 'User created successfully'
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    User login endpoint
    """
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'error': 'Please provide both username and password'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(username=username, password=password)

    if user:
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user': UzytkownikSerializer(user).data,
            'token': token.key
        })
    else:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def logout(request):
    """
    User logout endpoint
    """
    if request.auth:
        request.auth.delete()

    return Response({'message': 'Successfully logged out'})
