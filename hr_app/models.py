from django.db import models
from rest_framework import serializers
from django.core.validators import MinLengthValidator, RegexValidator

class Employee(models.Model):
    first_name = models.CharField(
        max_length=30,
        verbose_name='Имя',
        validators=[MinLengthValidator(2)]
    )
    last_name = models.CharField(
        max_length=30,
        verbose_name='Фамилия',
        validators=[MinLengthValidator(2)]
    )
    patronymic = models.CharField(
        max_length=30,
        verbose_name='Отчество',
        blank=True, null=True
    )
    date_of_birth = models.DateField(
        verbose_name='Дата рождения'
    )
    GENDER_CHOICES = [
        ('M', 'Мужской'),
        ('F', 'Женский'),
    ]
    gender = models.CharField(
        max_length=1,
        choices=GENDER_CHOICES,
        verbose_name='Пол'
    )
    nationality = models.CharField(
        max_length=50,
        verbose_name='Гражданство'
    )

    email = models.EmailField(
        unique=True,
        verbose_name='Электронная почта'
    )
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Номер телефона должен быть в формате: '+999999999'. До 15 цифр."
    )
    phone_number = models.CharField(
        validators=[phone_regex],
        max_length=17,
        verbose_name='Номер телефона'
    )
    address = models.CharField(
        max_length=255,
        verbose_name='Адрес проживания'
    )

    date_created = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата создания записи'
    )
    date_updated = models.DateTimeField(
        auto_now=True,
        verbose_name='Дата обновления записи'
    )

    def __str__(self):
        return f"{self.last_name} {self.first_name}"

    class Meta:
        verbose_name = 'Сотрудник'
        verbose_name_plural = 'Сотрудники'

class Education(models.Model):
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='educations',
        verbose_name='Сотрудник'
    )
    EDUCATION_LEVEL_CHOICES = [
        ('secondary', 'Среднее'),
        ('bachelor', 'Бакалавр'),
        ('master', 'Магистр'),
        ('phd', 'Докторская степень'),
    ]
    education_level = models.CharField(
        max_length=20,
        choices=EDUCATION_LEVEL_CHOICES,
        verbose_name='Уровень образования'
    )
    institution = models.CharField(
        max_length=100,
        verbose_name='Учебное заведение'
    )
    graduation_year = models.PositiveIntegerField(
        verbose_name='Год окончания',
        blank=True,
        null=True
    )
    specialty = models.CharField(
        max_length=100,
        verbose_name='Специальность'
    )

    def __str__(self):
        return f"{self.employee} - {self.institution}"

    class Meta:
        verbose_name = 'Образование'
        verbose_name_plural = 'Образование'

class WorkExperience(models.Model):
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='work_experiences',
        verbose_name='Сотрудник'
    )
    employer = models.CharField(
        max_length=100,
        verbose_name='Работодатель'
    )
    position = models.CharField(
        max_length=50,
        verbose_name='Должность'
    )
    start_date = models.DateField(
        verbose_name='Дата начала работы'
    )
    end_date = models.DateField(
        verbose_name='Дата окончания работы',
        blank=True,
        null=True
    )
    responsibilities = models.TextField(
        verbose_name='Обязанности',
        blank=True,
        null=True
    )

    def __str__(self):
        return f"{self.employee} - {self.position} at {self.employer}"

    class Meta:
        verbose_name = 'Опыт работы'
        verbose_name_plural = 'Опыт работы'

class Family(models.Model):
    employee = models.OneToOneField(
        Employee,
        on_delete=models.CASCADE,
        related_name='family',
        verbose_name='Сотрудник'
    )
    MARITAL_STATUS_CHOICES = [
        ('single', 'Не женат/не замужем'),
        ('married', 'Женат/Замужем'),
        ('divorced', 'Разведён/Разведена'),
        ('widowed', 'Вдова/Вдовец'),
    ]
    marital_status = models.CharField(
        max_length=10,
        choices=MARITAL_STATUS_CHOICES,
        verbose_name='Семейное положение'
    )
    number_of_children = models.PositiveIntegerField(
        default=0,
        verbose_name='Количество детей'
    )

    def __str__(self):
        return f"{self.employee} - {self.get_marital_status_display()}"

    class Meta:
        verbose_name = 'Семья'
        verbose_name_plural = 'Семья'

class PassportInfo(models.Model):
    employee = models.OneToOneField(
        Employee,
        on_delete=models.CASCADE,
        related_name='passport_info',
        verbose_name='Сотрудник'
    )
    passport_number = models.CharField(
        max_length=9,
        unique=True,
        validators=[RegexValidator(
            regex=r'^[A-Z]{2}\d{7}$',
            message='Номер паспорта должен состоять из двух заглавных букв и 7 цифр.'
        )],
        verbose_name='Номер паспорта'
    )
    issued_by = models.CharField(
        max_length=100,
        verbose_name='Кем выдан'
    )
    date_issued = models.DateField(
        verbose_name='Дата выдачи'
    )
    date_expiry = models.DateField(
        verbose_name='Срок действия'
    )

    def __str__(self):
        return f"{self.employee} - {self.passport_number}"

    class Meta:
        verbose_name = 'Паспортная информация'
        verbose_name_plural = 'Паспортная информация'

class Skill(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name='Навык'
    )

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = 'Навык'
        verbose_name_plural = 'Навыки'

class EmployeeSkill(models.Model):
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='skills',
        verbose_name='Сотрудник'
    )
    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        verbose_name='Навык'
    )

    def __str__(self):
        return f"{self.employee} - {self.skill}"

    class Meta:
        unique_together = ('employee', 'skill')
        verbose_name = 'Навык сотрудника'
        verbose_name_plural = 'Навыки сотрудников'

class Certification(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name='Сертификат'
    )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Сертификат'
        verbose_name_plural = 'Сертификаты'

class EmployeeCertification(models.Model):
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='certifications',
        verbose_name='Сотрудник'
    )
    certification = models.ForeignKey(
        Certification,
        on_delete=models.CASCADE,
        verbose_name='Сертификат'
    )
    date_obtained = models.DateField(
        verbose_name='Дата получения'
    )

    def __str__(self):
        return f"{self.employee} - {self.certification}"

    class Meta:
        unique_together = ('employee', 'certification')
        verbose_name = 'Сертификат сотрудника'
        verbose_name_plural = 'Сертификаты сотрудников'

class Language(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name='Язык'
    )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Язык'
        verbose_name_plural = 'Языки'

class EmployeeLanguage(models.Model):
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='languages',
        verbose_name='Сотрудник'
    )
    language = models.ForeignKey(
        Language,
        on_delete=models.CASCADE,
        verbose_name='Язык'
    )
    proficiency_level_choices = [
        ('beginner', 'Начальный'),
        ('intermediate', 'Средний'),
        ('advanced', 'Продвинутый'),
        ('native', 'Родной'),
    ]
    proficiency_level = models.CharField(
        max_length=12,
        choices=proficiency_level_choices,
        verbose_name='Уровень владения'
    )

    def __str__(self):
        return f"{self.employee} - {self.language} ({self.get_proficiency_level_display()})"

    class Meta:
        unique_together = ('employee', 'language')
        verbose_name = 'Язык сотрудника'
        verbose_name_plural = 'Языки сотрудников'
