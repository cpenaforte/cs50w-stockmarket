# Generated by Django 5.0 on 2023-12-10 13:25

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('stockmarket', '0004_remove_offer_stock_remove_offer_user_offer_userstock_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='offer',
            old_name='userStock',
            new_name='user_stock',
        ),
    ]
