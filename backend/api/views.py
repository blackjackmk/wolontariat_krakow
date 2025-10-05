from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.auth import authenticate
from django.http import HttpResponse
from django.core.files import File
from django.conf import settings
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from wolontariat_krakow.pdf_utils import get_pl_font_names
from wolontariat_krakow.models import Projekt, Oferta, Uzytkownik, Organizacja, Recenzja
from django.http import HttpResponse
from .serializers import (
    ProjektSerializer, OfertaSerializer, OfertaCreateSerializer,
    UzytkownikSerializer, OrganizacjaSerializer,
    RecenzjaSerializer, RecenzjaCreateSerializer
)
from .permissions import IsOrganization, IsOwnerOrReadOnly
import os



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

    def get_serializer_class(self):
        if self.action == 'create':
            return OfertaCreateSerializer
        return OfertaSerializer

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

        tematyka = self.request.query_params.get('tematyka')
        if tematyka:
            queryset = queryset.filter(tematyka__icontains=tematyka)
            
        # New filter for duration
        czas_trwania = self.request.query_params.get('czas_trwania')
        if czas_trwania:
            queryset = queryset.filter(czas_trwania__icontains=czas_trwania)
            
        # Filter for open offers (with no assigned volunteer)
        tylko_wolne = self.request.query_params.get('tylko_wolne')
        if tylko_wolne and tylko_wolne.lower() == 'true':
            queryset = queryset.filter(wolontariusz__isnull=True)
            
        # Filter by requirements (search in requirements text)
        wymagania = self.request.query_params.get('wymagania')
        if wymagania:
            queryset = queryset.filter(wymagania__icontains=wymagania)
            
        # Add search across multiple fields
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(tytul_oferty__icontains=search) |
                Q(lokalizacja__icontains=search) |
                Q(tematyka__icontains=search) |
                Q(wymagania__icontains=search)
            )
            
            # Only offers with no assigned volunteers via Zlecenie
            queryset = queryset.filter(~Q(zlecenia__wolontariusz__isnull=False))

        # Filter by completion only when explicitly requested.
        # This avoids breaking detail actions (e.g., certificates for completed offers).
        completed = self.request.query_params.get('completed')
        if completed is not None:
            if completed.lower() == 'true':
                queryset = queryset.filter(czy_ukonczone=True)
            else:
                queryset = queryset.filter(czy_ukonczone=False)

        return queryset

    def perform_create(self, serializer):
        if self.request.user.rola in ['organizacja', 'koordynator'] and self.request.user.organizacja:
            serializer.save(organizacja=self.request.user.organizacja)
        else:
            raise serializers.ValidationError({"error": "Only organization and coordinator users can create offers"})

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

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def certificate(self, request, pk=None):
        """Generate a per-offer PDF certificate (volunteers only).

        Conditions:
        - requester role must be 'wolontariusz'
        - offer must be completed (czy_ukonczone=True)
        - requester must be assigned to the offer
          (either as Oferta.wolontariusz or via Zlecenie participation)
        """
        offer = self.get_object()

        if request.user.rola != 'wolontariusz':
            return Response({'error': 'Only volunteers can download certificates'}, status=status.HTTP_403_FORBIDDEN)

        if not offer.czy_ukonczone:
            return Response({'error': 'Certificate available after completion'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate assignment: allow either direct FK assignment or Zlecenie participation
        assigned_direct = (offer.wolontariusz_id == request.user.id)
        assigned_via_zlecenie = offer.zlecenia.filter(wolontariusz=request.user).exists()
        if not (assigned_direct or assigned_via_zlecenie):
            return Response({'error': 'You are not assigned to this offer'}, status=status.HTTP_403_FORBIDDEN)

        # Generate a simple PDF using standard fonts
        buffer = BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        regular_font, bold_font = get_pl_font_names()
        pdf.setFont(bold_font, 20)
        pdf.drawCentredString(width / 2, height - 100, 'Zaświadczenie ukończenia')

        pdf.setFont(regular_font, 14)
        pdf.drawString(100, height - 150, f"Wolontariusz: {request.user.get_full_name() or request.user.username}")
        pdf.drawString(100, height - 170, f"E-mail: {request.user.email}")

        pdf.drawString(100, height - 200, 'Szczegóły oferty:')
        pdf.drawString(120, height - 220, f"Tytuł: {offer.tytul_oferty}")
        pdf.drawString(120, height - 240, f"Projekt: {offer.projekt.nazwa_projektu}")
        pdf.drawString(120, height - 260, f"Organizacja: {offer.organizacja.nazwa_organizacji}")

        pdf.showPage()
        pdf.save()
        buffer.seek(0)

        resp = HttpResponse(buffer.read(), content_type='application/pdf')
        safe_title = ''.join(ch for ch in offer.tytul_oferty if ch.isalnum() or ch in (' ', '-', '_')).strip().replace(' ', '_')
        filename = f"zaswiadczenie_oferta_{offer.id}_{safe_title or 'oferta'}.pdf"
        resp['Content-Disposition'] = f'attachment; filename="{filename}"'
        return resp

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
    
    @action(detail=True, methods=['get'])
    def certificate(self, request, pk=None):
        """
        Generate and download a certificate for the volunteer's completed offers
        """
        user = self.get_object()
        
        # Check if the requesting user is authorized to access this certificate
        if request.user != user and request.user.rola not in ['organizacja', 'koordynator']:
            return Response(
                {'error': 'You are not authorized to view this certificate'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        # Check if the user is a volunteer
        if user.rola != 'wolontariusz':
            return Response(
                {'error': 'Certificates are only available for volunteers'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Check if the volunteer has any completed assignments
        if not user.zlecenia.filter(czy_ukonczone=True).exists():
            return Response(
                {'error': 'This volunteer has no completed assignments'},
                status=status.HTTP_404_NOT_FOUND
            )
            
        try:
            # Generate the certificate PDF
            pdf_file = user.certyfikat_gen()
            
            # Create the HTTP response with PDF content
            response = HttpResponse(pdf_file, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="certificate_{user.username}.pdf"'
            return response
            
        except Exception as e:
            return Response(
                {'error': f'Error generating certificate: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_certificate(self, request):
        """
        Generate and download certificate for the current user
        """
        user = request.user
        
        # Check if the user is a volunteer
        if user.rola != 'wolontariusz':
            return Response(
                {'error': 'Certificates are only available for volunteers'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Check if the volunteer has any completed assignments
        if not user.zlecenia.filter(czy_ukonczone=True).exists():
            return Response(
                {'error': 'You have no completed assignments yet'},
                status=status.HTTP_404_NOT_FOUND
            )
            
        try:
            # Generate the certificate PDF
            pdf_file = user.certyfikat_gen()
            
            # Create the HTTP response with PDF content
            response = HttpResponse(pdf_file, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="certificate_{user.username}.pdf"'
            return response
            
        except Exception as e:
            return Response(
                {'error': f'Error generating certificate: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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

    # Additional validation for volunteers: require wiek
    rola = request.data.get('rola')
    if rola == 'wolontariusz':
        if 'wiek' not in request.data:
            return Response({'error': 'Missing required field: wiek'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            wiek_val = int(request.data.get('wiek'))
            if wiek_val < 0 or wiek_val > 120:
                return Response({'error': 'Wiek musi być liczbą w zakresie 0-120'}, status=status.HTTP_400_BAD_REQUEST)
        except (TypeError, ValueError):
            return Response({'error': 'Wiek musi być liczbą całkowitą'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = Uzytkownik.objects.create_user(
            username=request.data['username'],
            email=request.data['email'],
            password=request.data['password'],
            rola=request.data['rola'],
            nr_telefonu=request.data['nr_telefonu'],
            wiek=request.data.get('wiek', None),
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def certificate(request):
    """
    Generate and download a PDF certificate for the current user
    based on completed assignments.
    """
    user: Uzytkownik = request.user  # type: ignore
    try:
        content_file = user.certyfikat_gen()
        resp = HttpResponse(content_file.read(), content_type='application/pdf')
        filename = f"zaswiadczenie_{user.username}.pdf"
        resp['Content-Disposition'] = f'attachment; filename="{filename}"'
        return resp
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
