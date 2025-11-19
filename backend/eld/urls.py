from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'trips', views.TripViewSet)
router.register(r'hos-rules', views.HOSRulesViewSet, basename='hos-rules')

urlpatterns = [
    path('', include(router.urls)),
]
