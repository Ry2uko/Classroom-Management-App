from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    USER_TYPES = [
        ('basic', 'Basic'),
        ('admin', 'Admin'),
        ('super_admin', 'Super Admin')
    ]
    email = None
    type = models.CharField(max_length=20, choices=USER_TYPES, default='basic')
    middle_initial = models.CharField(max_length=1, null=True, blank=True, default='')
    classroom = models.ForeignKey(
        'Classroom', on_delete=models.SET_NULL, null=True, blank=True, related_name='users'
    )

    def __str__(self):
        middle_initial = ' '
        if self.middle_initial:
            middle_initial = f' {self.middle_initial}. '
        
        return f'{self.first_name}{middle_initial}{self.last_name}'   # Ex: Aiden Tyler E. Mendoza | 'Aiden Tyler' for first_name


class Classroom(models.Model):
    name = models.CharField(max_length=255)
    strand = models.CharField(max_length=255, null=True, blank=True)
    grade = models.IntegerField()
    drive_folder = models.CharField(max_length=255)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_classrooms'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.grade}-{self.strand}: {self.name}'  # Ex: 12-STEM: Our Lady of the Most Holy Rosary
        
