# Generated by Django 2.1 on 2018-09-20 17:14

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('design', '0014_design'),
    ]

    operations = [
        migrations.CreateModel(
            name='RealtimeDesign',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('Design', models.TextField()),
                ('Circuit', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='design.Circuit')),
            ],
        ),
        migrations.DeleteModel(
            name='Design',
        ),
    ]
