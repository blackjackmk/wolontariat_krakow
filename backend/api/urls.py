from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'projects', views.ProjektViewSet, basename='projects')
router.register(r'offers', views.OfertaViewSet, basename='offers')
router.register(r'volunteers', views.UzytkownikViewSet, basename='volunteers')
router.register(r'organizations', views.OrganizacjaViewSet, basename='organizations')

urlpatterns = [
    path('', include(router.urls)),
]
