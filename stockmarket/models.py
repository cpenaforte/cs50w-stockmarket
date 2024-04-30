from datetime import timedelta, datetime
from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class User(AbstractUser):
    available_balance = models.FloatField(default=10000)

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "available_balance": self.available_balance,
            "stocks": [x.serialize() for x in self.user_stocks.all()],
            "operations": [x.serialize() for x in self.operations.all()],
        }

class Stock(models.Model):
    symbol = models.CharField(max_length=10)
    name = models.CharField(max_length=100)
    max_available = models.IntegerField(default=1000)
    default_price = models.FloatField(default=100)

    def serialize(self):
        # get all offers for this stock, using user_stocks and joining all offers of all user_stocks in a list and concatenating them
        not_flatten_offers = [list(x.offers.all()) for x in self.user_stocks.all()]
        operations = []
        
        for sublist in not_flatten_offers:
            for item in sublist:
                try:
                    operation = item.operation
                    operations.append(operation)
                except:
                    continue
        
        operations.sort(key=lambda x: x.date, reverse=False)
        
        last_price = None
        try:
            last_price = operations[-1].offer.price
        except:
            pass
        
        return {
            "id": self.id,
            "symbol": self.symbol,
            "name": self.name,
            "max_available": self.max_available,
            "default_price": self.default_price,
            "last_price": last_price,
        }

class UserStock(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_stocks")
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name="user_stocks")
    quantity = models.IntegerField()

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "stock": self.stock.serialize(),
            "offers": [x.serialize() for x in self.offers.all()],
            "quantity": self.quantity,
        }

class Offer(models.Model):
    user_stock = models.ForeignKey(UserStock, on_delete=models.CASCADE, related_name="offers", null=True)
    quantity = models.IntegerField()
    price = models.FloatField()
    date = models.DateTimeField(auto_now_add=True)
    done = models.BooleanField(default=False)
    canceled = models.BooleanField(default=False)

    def serialize(self):
        sold_date = None
        try:
            sold_date = self.operation.date.strftime("%d/%m/%Y %H:%M:%S")
        except:
            pass
        
        active = False
        try:
            active = not self.operation
        except:
            active = False
        
        return {
            "id": self.id,
            "user": self.user_stock.user.username,
            "stock": self.user_stock.stock.symbol,
            "quantity": self.quantity,
            "price": self.price,
            "date": self.date.strftime("%d/%m/%Y %H:%M:%S"),
            "active": active,
            "sold": self.done,
            "sold_date": sold_date,
            "canceled": self.canceled,
        }

class Operation(models.Model):
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="operations")
    offer = models.OneToOneField(Offer, on_delete=models.CASCADE, related_name="operation")
    date = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "buyer": self.buyer.username,
            "offer": self.offer.serialize(),
            "date": self.date.strftime("%d/%m/%Y %H:%M:%S"),
        }

