# Generated by Django 2.1.1 on 2018-10-14 09:44

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('design', '0026_auto_20181013_1948'),
    ]

    operations = [
        migrations.AlterField(
            model_name='works',
            name='Circuit',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='design.Circuit'),
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
