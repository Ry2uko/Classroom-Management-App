# Generated by Django 5.1.4 on 2025-03-04 01:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0027_content_grade_level_alter_file_file_type_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='content',
            name='grade_level',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
