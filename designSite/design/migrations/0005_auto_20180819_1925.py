# Generated by Django 2.1 on 2018-08-19 11:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('design', '0004_auto_20180818_1841'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='username',
            field=models.CharField(max_length=32, unique=True),
        ),
    ]
