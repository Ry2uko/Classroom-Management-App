from django.contrib import admin
from .models import User, Classroom


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'username', 'classroom', 'type', 'role', 'sex')
    list_filter = ('classroom', 'classroom__strand', 'classroom__grade', 'type', 'role', 'sex')
    search_fields = ('username',)

    def full_name(self, obj):
        return str(obj)


@admin.register(Classroom)
class ClassroomAdmin(admin.ModelAdmin):
    list_display = ('classroom', 'grade', 'strand', 'created_by')
    list_filter = ('grade', 'strand')

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'class_adviser':
            kwargs['queryset'] = User.objects.filter(role='teacher')
            
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def classroom(self, obj):
        return str(obj)
    