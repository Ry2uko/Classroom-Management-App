# Generated by Django 5.1.4 on 2024-12-28 06:21

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_user_middle_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='email',
        ),
    ]
