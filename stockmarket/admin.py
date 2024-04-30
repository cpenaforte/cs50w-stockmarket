from django.contrib import admin

from .models import Stock, UserStock, Offer, Operation

admin.site.register(Stock)
admin.site.register(UserStock)
admin.site.register(Offer)
admin.site.register(Operation)

