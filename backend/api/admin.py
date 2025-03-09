from django.contrib import admin
from .models import User, Classroom, Course, File, Content, ContentAttachment
from .utils import generate_unique_password

def set_random_password(modeladmin, request, queryset):
    """ Set random passwords for selected users. """

    for user in queryset:
        if user.type == 'student':
            password = generate_unique_password(4)
        else:
            password = generate_unique_password(6)

        print(f'{user.full_name}\t{password}')
        user.set_password(password)
        user.save()
        modeladmin.message_user(request, f'Password for {user.full_name} set to {password}')


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'username', 'classroom', 'type', 'role', 'sex')
    list_filter = ('classroom', 'classroom__strand', 'classroom__grade_level', 'type', 'role', 'sex')
    search_fields = ('username',)
    actions = (set_random_password,)

    def full_name(self, obj):
        return str(obj)


@admin.register(Classroom)
class ClassroomAdmin(admin.ModelAdmin):
    list_display = ('classroom', 'grade_level', 'strand', 'class_adviser')
    list_filter = ('grade_level', 'strand')

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'class_adviser':
            kwargs['queryset'] = User.objects.filter(role='teacher')

        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def classroom(self, obj):
        return str(obj)


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('name', 'assigned', 'classroom')
    list_filter = ('classroom', 'is_major')
    search_fields = ('name',)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'assigned':
            kwargs['queryset'] = User.objects.filter(role='teacher')

        return super().formfield_for_foreignkey(db_field, request, **kwargs)


@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'file_type', 'drive_id', 'uploaded_by', 'uploaded_on')
    list_filter = ('file_type',)
    search_fields = ('file_name', 'drive_id')
    

@admin.register(Content)
class ContentAdmin(admin.ModelAdmin):
    list_display = ('title', 'content_type', 'visibility', 'course', 'classroom')
    list_filter = ('content_type', 'course', 'classroom', 'visibility')
    search_fields = ('title',)


@admin.register(ContentAttachment)
class ContentAttachmentAdmin(admin.ModelAdmin):
    list_display = ('content', 'file', 'url')
    list_filter = ('content__content_type', 'content__visibility', 'content__course', 'content__classroom')
    search_fields = ('content__title',)