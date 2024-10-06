from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, SkillViewSet, CertificationViewSet, LanguageViewSet

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'skills', SkillViewSet, basename='skill')
router.register(r'certifications', CertificationViewSet, basename='certification')
router.register(r'languages', LanguageViewSet, basename='language')

urlpatterns = [
    path('', include(router.urls)),
]