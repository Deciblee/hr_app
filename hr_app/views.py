from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import Employee, Skill, Certification, Language
from .serializers import (EmployeeSerializer, SkillSerializer, CertificationSerializer, LanguageSerializer)

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

    def create(self, request, *args, **kwargs):
        employee_data = request.data
        employee_serializer = self.get_serializer(data=employee_data)
        employee_serializer.is_valid(raise_exception=True)
        employee = employee_serializer.save()
        return Response(employee_serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        employee_data = request.data
        employee_serializer = self.get_serializer(instance, data=employee_data, partial=partial)
        employee_serializer.is_valid(raise_exception=True)
        employee = employee_serializer.save()
        return Response(employee_serializer.data)


class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer


class CertificationViewSet(viewsets.ModelViewSet):
    queryset = Certification.objects.all()
    serializer_class = CertificationSerializer


class LanguageViewSet(viewsets.ModelViewSet):
    queryset = Language.objects.all()
    serializer_class = LanguageSerializer

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = [
        'first_name',
        'last_name',
        'patronymic',
        'date_of_birth',
        'gender',
        'nationality',
        'email',
        'phone_number',
        'address',
        'family__marital_status',
        'family__number_of_children',
        'passport_info__passport_number',
        'passport_info__issued_by',
        'passport_info__date_issued',
        'passport_info__date_expiry',
        'skills__skill__name',
        'certifications__certification__name',
        'languages__language__name',
    ]