import datetime
from django.db import transaction
from rest_framework import serializers
from .models import (
    Employee, Education, WorkExperience, Family, PassportInfo,
    EmployeeSkill, EmployeeCertification, EmployeeLanguage,
    Skill, Certification, Language
)


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']

    def validate_name(self, value):
        if Skill.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError('Навык с таким названием уже существует.')
        return value

class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = ['id', 'name']

    def validate_name(self, value):
        if Certification.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError('Такой сертификат уже существует.')
        return value

class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = ['id', 'name']

    def validate_name(self, value):
        if Language.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError('Такой язык уже существует.')
        return value


class FamilySerializer(serializers.ModelSerializer):
    class Meta:
        model = Family
        fields = ['marital_status', 'number_of_children']

    def validate_number_of_children(self, value):
        if value < 0:
            raise serializers.ValidationError('Количество детей не может быть отрицательным.')
        return value

class PassportInfoSerializer(serializers.ModelSerializer):
    passport_number = serializers.CharField()

    class Meta:
        model = PassportInfo
        fields = ['passport_number', 'issued_by', 'date_issued', 'date_expiry']

    def validate(self, data):
        if data['date_expiry'] <= data['date_issued']:
            raise serializers.ValidationError('Срок действия должен быть позже даты выдачи.')
        return data

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ['education_level', 'institution', 'graduation_year', 'specialty']

    def validate_graduation_year(self, value):
        current_year = datetime.date.today().year
        if value > current_year:
            raise serializers.ValidationError('Год окончания не может быть в будущем.')
        return value

class WorkExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkExperience
        fields = ['employer', 'position', 'start_date', 'end_date', 'responsibilities']

    def validate(self, data):
        if data.get('end_date') and data['end_date'] < data['start_date']:
            raise serializers.ValidationError('Дата окончания работы не может быть раньше даты начала.')
        return data

class EmployeeSkillSerializer(serializers.ModelSerializer):
    skill = SkillSerializer(read_only=True)

    class Meta:
        model = EmployeeSkill
        fields = ['skill']

class EmployeeCertificationSerializer(serializers.ModelSerializer):
    certification = CertificationSerializer(read_only=True)
    date_obtained = serializers.DateField()

    class Meta:
        model = EmployeeCertification
        fields = ['certification', 'date_obtained']

class EmployeeLanguageSerializer(serializers.ModelSerializer):
    language = LanguageSerializer(read_only=True)
    proficiency_level = serializers.CharField()

    class Meta:
        model = EmployeeLanguage
        fields = ['language', 'proficiency_level']


class EmployeeSerializer(serializers.ModelSerializer):
    family = FamilySerializer()
    educations = EducationSerializer(many=True)
    work_experiences = WorkExperienceSerializer(many=True)
    passport_info = PassportInfoSerializer()

    
    skills = serializers.ListField(write_only=True, required=False)
    certifications = serializers.ListField(write_only=True, required=False)
    languages = serializers.ListField(write_only=True, required=False)

    
    skills_info = EmployeeSkillSerializer(many=True, read_only=True, source='skills')
    certifications_info = EmployeeCertificationSerializer(many=True, read_only=True, source='certifications')
    languages_info = EmployeeLanguageSerializer(many=True, read_only=True, source='languages')

    class Meta:
        model = Employee
        fields = [
            'id', 'first_name', 'last_name', 'patronymic', 'date_of_birth',
            'gender', 'nationality', 'email', 'phone_number', 'address',
            'family', 'educations', 'work_experiences', 'passport_info',
            'skills', 'certifications', 'languages',
            'skills_info', 'certifications_info', 'languages_info'
        ]

    def validate_date_of_birth(self, value):
        if value > datetime.date.today():
            raise serializers.ValidationError('Дата рождения не может быть в будущем.')
        return value

    def create(self, validated_data):
        print("create")
        
        family_data = validated_data.pop('family')
        passport_info_data = validated_data.pop('passport_info')
        educations_data = validated_data.pop('educations', [])
        work_experiences_data = validated_data.pop('work_experiences', [])
        skills_data = validated_data.pop('skills', [])
        certifications_data = validated_data.pop('certifications', [])
        languages_data = validated_data.pop('languages', [])

        with transaction.atomic():
            
            employee = Employee.objects.create(**validated_data)

            
            Family.objects.create(employee=employee, **family_data)

            
            PassportInfo.objects.create(employee=employee, **passport_info_data)

            
            for education_data in educations_data:
                Education.objects.create(employee=employee, **education_data)

            
            for work_experience_data in work_experiences_data:
                WorkExperience.objects.create(employee=employee, **work_experience_data)

            
            for skill_data in skills_data:
                skill_id = skill_data.get('skill_id')
                try:
                    skill = Skill.objects.get(id=skill_id)
                    EmployeeSkill.objects.create(employee=employee, skill=skill)
                except Skill.DoesNotExist:
                    raise serializers.ValidationError(f"Skill with id {skill_id} does not exist.")

            
            for cert_data in certifications_data:
                certification_id = cert_data.get('certification_id')
                date_obtained = cert_data.get('date_obtained')
                try:
                    certification = Certification.objects.get(id=certification_id)
                    EmployeeCertification.objects.create(
                        employee=employee,
                        certification=certification,
                        date_obtained=date_obtained
                    )
                except Certification.DoesNotExist:
                    raise serializers.ValidationError(f"Certification with id {certification_id} does not exist.")

            
            for lang_data in languages_data:
                language_id = lang_data.get('language_id')
                proficiency_level = lang_data.get('proficiency_level')
                try:
                    language = Language.objects.get(id=language_id)
                    EmployeeLanguage.objects.create(
                        employee=employee,
                        language=language,
                        proficiency_level=proficiency_level
                    )
                except Language.DoesNotExist:
                    raise serializers.ValidationError(f"Language with id {language_id} does not exist.")

            return employee

    def update(self, instance, validated_data):
        print("update")
        
        family_data = validated_data.pop('family', None)
        passport_info_data = validated_data.pop('passport_info', None)
        educations_data = validated_data.pop('educations', None)
        work_experiences_data = validated_data.pop('work_experiences', None)
        skills_data = validated_data.pop('skills', None)
        certifications_data = validated_data.pop('certifications', None)
        languages_data = validated_data.pop('languages', None)

        with transaction.atomic():
            
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            
            if family_data:
                family_instance = instance.family
                for attr, value in family_data.items():
                    setattr(family_instance, attr, value)
                family_instance.save()

            
            if passport_info_data:
                passport_info_instance = instance.passport_info
                for attr, value in passport_info_data.items():
                    setattr(passport_info_instance, attr, value)
                passport_info_instance.save()

            
            if educations_data is not None:
                
                Education.objects.filter(employee=instance).delete()
                
                for education_data in educations_data:
                    Education.objects.create(employee=instance, **education_data)

            
            if work_experiences_data is not None:
                
                WorkExperience.objects.filter(employee=instance).delete()
                
                for work_experience_data in work_experiences_data:
                    WorkExperience.objects.create(employee=instance, **work_experience_data)

            
            if skills_data is not None:
                
                EmployeeSkill.objects.filter(employee=instance).delete()
                
                for skill_data in skills_data:
                    skill_id = skill_data.get('skill_id')
                    try:
                        skill = Skill.objects.get(id=skill_id)
                        EmployeeSkill.objects.create(employee=instance, skill=skill)
                    except Skill.DoesNotExist:
                        raise serializers.ValidationError(f"Skill with id {skill_id} does not exist.")

            
            if certifications_data is not None:
                
                EmployeeCertification.objects.filter(employee=instance).delete()
                
                for cert_data in certifications_data:
                    certification_id = cert_data.get('certification_id')
                    date_obtained = cert_data.get('date_obtained')
                    try:
                        certification = Certification.objects.get(id=certification_id)
                        EmployeeCertification.objects.create(
                            employee=instance,
                            certification=certification,
                            date_obtained=date_obtained
                        )
                    except Certification.DoesNotExist:
                        raise serializers.ValidationError(f"Certification with id {certification_id} does not exist.")

            
            if languages_data is not None:
                
                EmployeeLanguage.objects.filter(employee=instance).delete()
                
                for lang_data in languages_data:
                    language_id = lang_data.get('language_id')
                    proficiency_level = lang_data.get('proficiency_level')
                    try:
                        language = Language.objects.get(id=language_id)
                        EmployeeLanguage.objects.create(
                            employee=instance,
                            language=language,
                            proficiency_level=proficiency_level
                        )
                    except Language.DoesNotExist:
                        raise serializers.ValidationError(f"Language with id {language_id} does not exist.")

            return instance

