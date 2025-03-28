from django.contrib.auth.models import AbstractUser
from django.db import models
from .constants import *
import os


class User(AbstractUser):
    type = models.CharField(max_length=20, choices=USER_TYPES, default='student')
    role = models.CharField(max_length=20, choices=USER_ROLES, default='student')
    sex = models.CharField(max_length=1, choices=SEX_CHOICES, null=True)
    profile_img = models.ImageField(upload_to='profile_imgs/', null=True, blank=True, default=None)
    middle_initial = models.CharField(max_length=1, null=True, blank=True, default='')
    classroom = models.ForeignKey(
        'Classroom', on_delete=models.SET_NULL, null=True, blank=True, related_name='users'
    )

    def save(self, *args, **kwargs):

        # Handle profile image
        if self.profile_img and not self.profile_img.name.startswith('images/default'):
            # Save to classroom folder (classroom id) or faculty folder
            if self.role == 'teacher':
                folder = 'faculty'
            else:
                folder = str(self.classroom.id)

            ext = os.path.splitext(self.profile_img.name)[1]
            self.profile_img.name = os.path.join(folder, f'{self.id}{ext}')
        else:
            # Handle default profile images
            if self.sex == 'M':
                self.profile_img.name = 'images/default_m.jpg'
            elif self.sex == 'F':
                self.profile_img.name = 'images/default_f.jpg'
            else:
                self.profile_img.name = 'images/default.jpg'

        super().save(*args, **kwargs)

    @property
    def full_name(self):
        middle_initial = ' '
        if self.middle_initial:
            middle_initial = f' {self.middle_initial}. '
        
        return f'{self.first_name}{middle_initial}{self.last_name}'   # Ex: Aiden Tyler E. Mendoza | 'Aiden Tyler' for first_name
    
    def __str__(self):
        return self.full_name


class Classroom(models.Model):
    name = models.CharField(max_length=255)
    strand = models.CharField(max_length=255, null=True, blank=True)
    grade_level = models.IntegerField()
    grade_folder_id = models.CharField(max_length=255, blank=True, default='')
    classroom_folder_id = models.CharField(max_length=255, blank=True, default='')
    sheet_id = models.CharField(max_length=255, blank=True, default='')
    class_adviser = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='advising_class'
    )

    # Because of specific context in SGA, as of 2025, grade levels share a single classroom
    # For the core subjects. SGA CMA was designed following the regular classroom system, where each
    # strand has a separate classroom of its own, but for making things convenient, we, the developers
    # slightly modified the design to follow the SGA classroom system. Additionally, this app is only for 
    # senior high (for now), so to avoid breaking stuff.
    senior_high = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.grade_level}-{self.strand} {self.name}'  # Ex: 12-STEM: Our Lady of the Most Holy Rosary


class Course(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True, default='')
    is_major = models.BooleanField(default=False)
    grade_level = models.IntegerField()  # For core subjects
    course_folder_id = models.CharField(max_length=255, blank=True, default='') 
    assigned = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_courses'
    )
    classroom = models.ForeignKey(
        Classroom, on_delete=models.CASCADE, null=True, blank=True, related_name='courses'
    )

    def __str__(self):
        return self.name
    

class File(models.Model):
    file_name = models.CharField(max_length=255)
    drive_web_link = models.TextField(blank=True, null=True, default='') 
    drive_id = models.CharField(max_length=255)
    file_type = models.CharField(max_length=20)
    file_size = models.BigIntegerField(null=True, blank=True)
    mime_type = models.CharField(max_length=255, null=True)
    uploaded_on = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, related_name='uploaded_files', null=True
    )

    def __str__(self):
        return self.file_name


class Content(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField(null=True, blank=True, default='')
    content_category = models.CharField(max_length=20, choices=CONTENT_CATEGORIES, default='other')
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES, default='text')
    content_folder_id = models.CharField(max_length=255, blank=True, default='')
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='classroom')
    is_archived = models.BooleanField(default=False)
    archived_at = models.DateTimeField(null=True, blank=True)
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name='contents', null=True, blank=True
    )
    classroom = models.ForeignKey(
        Classroom, on_delete=models.CASCADE, related_name='contents', null=True, blank=True
    )
    grade_level = models.IntegerField(null=True, blank=True)  # For core subjects
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='created_contents'
    )
    created_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class ContentAttachment(models.Model):
    attachment_type = models.CharField(max_length=20, choices=ATTACHMENT_TYPES, default='file')
    content = models.ForeignKey(
        Content, on_delete=models.CASCADE, related_name='attachments'
    )
    file = models.ForeignKey(
        File, on_delete=models.CASCADE, null=True, blank=True, related_name='attachments'
    )
    url = models.URLField(null=True, blank=True)
