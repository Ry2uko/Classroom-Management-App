# Generated by Django 5.1.4 on 2025-01-19 19:15

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0014_remove_classroom_drive_folder_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='classroom',
            old_name='spreadsheet_id',
            new_name='sheet_id',
        ),
    ]
