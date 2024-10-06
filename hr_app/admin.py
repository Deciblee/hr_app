from django.contrib import admin

# Register your models here.

from .models import (
    Employee, Education, WorkExperience, Family, PassportInfo,
    Skill, EmployeeSkill, Certification, EmployeeCertification,
    Language, EmployeeLanguage
)

admin.site.register(Employee)
admin.site.register(Education)
admin.site.register(WorkExperience)
admin.site.register(Family)
admin.site.register(PassportInfo)
admin.site.register(Skill)
admin.site.register(EmployeeSkill)
admin.site.register(Certification)
admin.site.register(EmployeeCertification)
admin.site.register(Language)
admin.site.register(EmployeeLanguage)