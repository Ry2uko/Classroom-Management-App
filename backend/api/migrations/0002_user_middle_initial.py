# Generated by Django 5.1.4 on 2024-12-28 06:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='middle_initial',
            field=models.CharField(blank=True, default='', max_length=1, null=True),
        ),
    ]
