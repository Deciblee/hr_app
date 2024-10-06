from typing import Any
from django import forms
from django.forms import inlineformset_factory
from django.core.exceptions import ValidationError
from .models import (
    Employee, Education, WorkExperience, Family, PassportInfo,
    EmployeeSkill, EmployeeCertification, EmployeeLanguage,
    Skill, Certification, Language
)
import datetime

class EmployeeForm(forms.ModelForm):
    class Meta:
        model = Employee
        fields = [
            'first_name', 'last_name', 'patronymic', 'date_of_birth',
            'gender', 'nationality', 'email', 'phone_number', 'address',
        ]
        labels = {
            'first_name': 'Имя',
            'last_name': 'Фамилия',
            'patronymic': 'Отчество',
            'date_of_birth': 'Дата рождения',
            'gender': 'Пол',
            'nationality': 'Гражданство',
            'email': 'Электронная почта',
            'phone_number': 'Номер телефона',
            'address': 'Адрес проживания',
        }
        widgets = {
            'date_of_birth': forms.DateInput(attrs={'type': 'date'}),
            'gender': forms.Select(choices=Employee.GENDER_CHOICES),
        }

    def clean_date_of_birth(self):
        date_of_birth = self.cleaned_data['date_of_birth']
        if date_of_birth > datetime.date.today():
            raise ValidationError('Дата рождения не может быть в будущем.')
        return date_of_birth

class FamilyForm(forms.ModelForm):
    class Meta:
        model = Family
        fields = ['marital_status', 'number_of_children']
        labels = {
            'marital_status': 'Семейное положение',
            'number_of_children': 'Количество детей',
        }
        widgets = {
            'marital_status': forms.Select(choices=Family.MARITAL_STATUS_CHOICES),
        }
    
    def clean_number_of_children(self):
        number_of_children = self.cleaned_data['number_of_children']
        if number_of_children < 0:
            raise ValidationError('Количество детей не может быть отрицательным.')
        return number_of_children
        

class PassportInfoForm(forms.ModelForm):
    class Meta:
        model = PassportInfo
        fields = ['passport_number', 'issued_by', 'date_issued', 'date_expiry']
        labels = {
            'passport_number': 'Номер паспорта',
            'issued_by': 'Кем выдан',
            'date_issued': 'Дата выдачи',
            'date_expiry': 'Срок действия',
        }
        widgets = {
            'date_issued': forms.DateInput(attrs={'type': 'date'}),
            'date_expiry': forms.DateInput(attrs={'type': 'date'}),
        }

    def clean(self):
        cleaned_data = super().clean()
        date_issued = cleaned_data.get('date_issued')
        date_expiry = cleaned_data.get('date_expiry')
        if date_issued and date_expiry and date_expiry <= date_issued:
            raise ValidationError('Срок действия должен быть позже даты выдачи.')

class EducationForm(forms.ModelForm):
    institution = forms.CharField(required=False,label='Учебное заведение')
    specialty = forms.CharField(required=False,label='Специальность')
    graduation_year = forms.IntegerField(required=False, label='Год окончания', initial=datetime.date.today().year)

    class Meta:
        model = Education
        fields = ['education_level', 'institution', 'graduation_year', 'specialty']
        labels = {
            'education_level': 'Уровень образования',
        }
        widgets = {
            'education_level': forms.Select(choices=Education.EDUCATION_LEVEL_CHOICES),
        }

    def clean_graduation_year(self):
        graduation_year = self.cleaned_data['graduation_year']
        current_year = datetime.date.today().year
        if graduation_year and graduation_year > current_year:
            raise ValidationError('Год окончания не может быть в будущем.')
        return graduation_year

class WorkExperienceForm(forms.ModelForm):
    start_date = forms.DateField(required=False, widget=forms.DateInput(attrs={'type': 'date'}),label='Дата начала работы')
    end_date = forms.DateField(required=False, widget=forms.DateInput(attrs={'type': 'date'}),label='Дата окончания работы')
    responsibilities = forms.CharField(required=False, widget=forms.Textarea(attrs={'rows': 3}),label='Обязанности')

    class Meta:
        model = WorkExperience
        fields = ['employer', 'position', 'start_date', 'end_date', 'responsibilities']
        labels = {
            'employer': 'Работодатель',
            'position': 'Должность',
        }

    def clean(self):
        cleaned_data = super().clean()
        start_date = cleaned_data.get('start_date')
        end_date = cleaned_data.get('end_date')
        if start_date and end_date and end_date < start_date:
            raise ValidationError('Дата окончания работы не может быть раньше даты начала.')

class EmployeeSkillForm(forms.ModelForm):
    class Meta:
        model = EmployeeSkill
        fields = ['skill']
        labels = {
            'skill': 'Навык',
        }

class EmployeeCertificationForm(forms.ModelForm):
    class Meta:
        model = EmployeeCertification
        fields = ['certification', 'date_obtained']
        labels = {
            'certification': 'Сертификат',
            'date_obtained': 'Дата получения',
        }
        widgets = {
            'date_obtained': forms.DateInput(attrs={'type': 'date'}),
        }

    def clean_date_obtained(self):
        date_obtained = self.cleaned_data['date_obtained']
        if date_obtained > datetime.date.today():
            raise ValidationError('Дата получения не может быть в будущем.')
        return date_obtained

class EmployeeLanguageForm(forms.ModelForm):
    class Meta:
        model = EmployeeLanguage
        fields = ['language', 'proficiency_level']
        labels = {
            'language': 'Язык',
            'proficiency_level': 'Уровень владения',
        }
        widgets = {
            'proficiency_level': forms.Select(choices=EmployeeLanguage.proficiency_level_choices),
        }

class SkillCreationForm(forms.ModelForm):
    class Meta:
        model = Skill
        fields = ['name']
        labels = {
            'name': 'Название навыка',
        }

    def clean(self):
        name = self.cleaned_data['name']
        if Skill.objects.filter(name__iexact=name).exists():
            raise ValidationError("Навык с таким названием уже существует.")

class CertificationCreationForm(forms.ModelForm):
    class Meta:
        model = Certification
        fields = ['name']
        labels = {
            'name': 'Название сертификата',
        }
    def clean(self):
        name = self.cleaned_data['name']
        if Certification.objects.filter(name__iexact=name).exists():
            raise ValidationError("Такой сертификат уже существует.")  

class LanguageCreationForm(forms.ModelForm):
    class Meta:
        model = Language
        fields = ['name']
        labels = {
            'name': 'Язык',
        }
    def clean(self):
        name = self.cleaned_data['name']
        if Language.objects.filter(name__iexact=name).exists():
            raise ValidationError("Такой язык уже существует.")

EducationFormSet = inlineformset_factory(
    Employee, Education, form=EducationForm,
    fields=['education_level', 'institution', 'graduation_year', 'specialty'],
    extra=1, can_delete=True
)

WorkExperienceFormSet = inlineformset_factory(
    Employee, WorkExperience, form=WorkExperienceForm,
    fields=['employer', 'position', 'start_date', 'end_date', 'responsibilities'],
    extra=1, can_delete=True
)

EmployeeSkillFormSet = inlineformset_factory(
    Employee, EmployeeSkill, form=EmployeeSkillForm,
    fields=['skill'],
    extra=1, can_delete=True
)

EmployeeCertificationFormSet = inlineformset_factory(
    Employee, EmployeeCertification, form=EmployeeCertificationForm,
    fields=['certification', 'date_obtained'],
    extra=1, can_delete=True
)

EmployeeLanguageFormSet = inlineformset_factory(
    Employee, EmployeeLanguage, form=EmployeeLanguageForm,
    fields=['language', 'proficiency_level'],
    extra=1, can_delete=True
)

class EmployeeSearchForm(forms.Form):
    query = forms.CharField(label='Поиск', min_length=3, max_length=100, required=False)

