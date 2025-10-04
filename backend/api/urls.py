from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    UzytkownikViewSet,
    OrganizacjaViewSet,
    ProjektViewSet,
    OfertaViewSet,
    WiadomoscViewSet
)

router = DefaultRouter()
router.register(r'projects', ProjektViewSet, basename='projects')
router.register(r'uzytkownicy', UzytkownikViewSet, basename='uzytkownicy')
router.register(r'organizacje', OrganizacjaViewSet, basename='organizacje')
router.register(r'projekty', ProjektViewSet, basename='projekty')
router.register(r'oferty', OfertaViewSet, basename='oferty')
router.register(r'wiadomosci', WiadomoscViewSet, basename='wiadomosci')

urlpatterns = [
    path('', include(router.urls)),
]
