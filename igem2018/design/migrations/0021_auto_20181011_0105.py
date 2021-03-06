# Generated by Django 2.1.1 on 2018-10-10 17:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('design', '0020_auto_20181009_0426'),
    ]

    operations = [
        migrations.AddField(
            model_name='parts',
            name='Safety',
            field=models.IntegerField(default=-1),
        ),
        migrations.AlterField(
            model_name='works',
            name='DefaultImg',
            field=models.URLField(default='static\\img\\Team_img\\none.jpg'),
        ),
        migrations.AlterField(
            model_name='works',
            name='logo',
            field=models.URLField(default='static\\img\\Team_img\\none.jpg'),
        ),
    ]
