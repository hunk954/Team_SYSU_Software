# Generated by Django 2.1.1 on 2018-10-17 19:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('design', '0031_auto_20181017_2248'),
    ]

    operations = [
        migrations.AlterField(
            model_name='works',
            name='DefaultImg',
            field=models.URLField(default='static/img/Team_img/none.jpg'),
        ),
        migrations.AlterField(
            model_name='works',
            name='logo',
            field=models.URLField(default='static/img/Team_img/none.jpg'),
        ),
    ]
