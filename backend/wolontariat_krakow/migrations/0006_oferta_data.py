from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('wolontariat_krakow', '0005_uzytkownik_wiek'),
    ]

    operations = [
        migrations.AddField(
            model_name='oferta',
            name='data',
            field=models.DateField(null=True, blank=True, help_text='Data (RRRR-MM-DD)'),
        ),
    ]

