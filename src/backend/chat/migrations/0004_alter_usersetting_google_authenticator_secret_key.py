# Generated by Django 4.1.2 on 2024-03-18 15:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0003_alter_usersetting_type_of_2fa'),
    ]

    operations = [
        migrations.AlterField(
            model_name='usersetting',
            name='google_authenticator_secret_key',
            field=models.CharField(blank=True, default='', max_length=64, null=True),
        ),
    ]