from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'projects', views.ProjektViewSet, basename='projects')
router.register(r'offers', views.OfertaViewSet, basename='offers')
router.register(r'volunteers', views.UzytkownikViewSet, basename='volunteers')
router.register(r'organizations', views.OrganizacjaViewSet, basename='organizations')
router.register(r'reviews', views.RecenzjaViewSet, basename='recenzja')

urlpatterns = [
    path('', include(router.urls)),

	# Authentication endpoints
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login, name='login'),
    path('auth/logout/', views.logout, name='logout'),
    path('auth/certificate/', views.certificate, name='certificate'),

    # Keep DRF's built-in session auth for admin
    path('auth/', include('rest_framework.urls')),
]
