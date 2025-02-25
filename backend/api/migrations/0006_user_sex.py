# Generated by Django 5.1.4 on 2025-01-16 13:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_user_role'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='sex',
            field=models.CharField(choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other')], max_length=1, null=True),
        ),
    ]
