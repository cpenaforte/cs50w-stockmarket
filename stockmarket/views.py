from datetime import datetime
from django.db import IntegrityError
from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.urls import reverse
from .utils import populate_summary
import json

from .models import User, Stock, UserStock, Offer, Operation

def index(request):
    if request.path == "/portfolio":
        return render(request, "stockmarket/index.html", {
            "start_page": "portfolio"
        })
    if request.path == "/stocks":
        return render(request, "stockmarket/index.html", {
            "start_page": "stocks"
        })
    return render(request, "stockmarket/index.html", {
            "start_page": "dashboard"
        })

@login_required
def user(request):
    return JsonResponse(request.user.serialize(), safe=False, status=200)

@login_required
def stocks(request):
    # create json array with stocks
    stocks = [x.serialize() for x in Stock.objects.all()]
    return JsonResponse(stocks, safe=False, status=200)

@login_required
def portfolio(request):
    # pick all stocks from user
    user_stocks = [x.serialize() for x in request.user.user_stocks.all()]
    return JsonResponse(user_stocks, safe=False, status=200)

@login_required
def stock(request, stock_id):
    # pick stock from database
    stock = Stock.objects.get(pk=stock_id)
    return JsonResponse(stock.serialize(), safe=False, status=200)

@login_required
def dashboard(request):
    summary = {
        "week": [],
        "month": [],
        "year": [],
        "ten_years": [],
    }
    
    summary["week"] = populate_summary("week", request.user)
    summary["month"] = populate_summary("month", request.user)
    
    if request.GET.get("year", False) == "true":
        summary["year"] = populate_summary("year", request.user)
    
    if request.GET.get("ten_years", False) == "true":
        summary["ten_years"] = populate_summary("ten_years", request.user)
    
    return JsonResponse(summary, safe=False, status=200)

@csrf_exempt
@login_required
def stock_offers(request, stock_id):
    if request.method == "POST":
        data = json.loads(request.body)
        price = data.get("price")
        if not price:
            return JsonResponse({"error": "Price must be provided."}, status=400)
        
        quantity = data.get("quantity")
        if not quantity:
            return JsonResponse({"error": "Quantity must be provided."}, status=400)
        
        stock = None
        try:
            stock = Stock.objects.get(pk=stock_id)
        except Stock.DoesNotExist:
            return JsonResponse({"error": "Stock not found."}, status=404)
        
        user_stock = None
        try:
            user_stock = UserStock.objects.get(user=request.user, stock=stock)
        except UserStock.DoesNotExist:
            return JsonResponse({"error": "You don't have this stock."}, status=400)
        
        # throw error if user doesn't have enough quantity
        if user_stock.quantity < quantity:
            return JsonResponse({"error": "You don't have enough quantity of this stock."}, status=400)
        
        offer = Offer(
            user_stock = user_stock,
            quantity = quantity,
            price = price,
            date = datetime.now().date(),
        )
        offer.save()
        
        return JsonResponse(offer.serialize(), safe=False, status=201)
        
    # pick user_stock from database
    try:
        stock = Stock.objects.get(pk=stock_id)
    except Stock.DoesNotExist:
        return JsonResponse({"error": "Stock not found."}, status=404)
    
    user_stocks = UserStock.objects.filter(stock=stock).all()
    offers = [offer.serialize() for user_stock in user_stocks for offer in user_stock.offers.order_by("-date").filter(done=False, canceled=False).all() if ((request.GET["other_users"] != "true") or (offer.user_stock.user != request.user))]
    offers.sort(key=lambda x: x["date"], reverse=True)
    
    return JsonResponse(offers, safe=False, status=200)

@csrf_exempt
@login_required
def stock_offer(request, stock_id, offer_id):
    if request.method == "PUT":
        data = json.loads(request.body)
        try:
            offer = Offer.objects.get(pk=offer_id)
        except Offer.DoesNotExist:
            return JsonResponse({"error": "Offer not found."}, status=404)
        
        price = data.get("price")
        if price:
            offer.price = price
            
        quantity = data.get("quantity")
        if quantity:
            offer.quantity = quantity
            
        canceled = data.get("canceled") if data.get("canceled") != None else False
        offer.canceled = canceled
        
        offer.save()
        
        return JsonResponse(offer.serialize(), safe=False, status=200)

    if request.method == "DELETE":
        try:
            offer = Offer.objects.get(pk=offer_id)
        except Offer.DoesNotExist:
            return JsonResponse({"error": "Offer not found."}, status=404)
        
        if not offer.done:
            offer.delete()
            
            return JsonResponse(status=204)
        
        return JsonResponse({"error": "Offer already done. You cannot delete it."}, status=400)
        
    # pick user_stock from database
    offer = None
    try:
        offer = Offer.objects.get(pk=offer_id)
    except Offer.DoesNotExist:
        return JsonResponse({"error": "Offer not found."}, status=404)
    
    if offer.user_stock.user != request.user:
        return JsonResponse({"error": "You don't have this offer."}, status=400)

    if offer.user_stock.stock.id != stock_id:
        return JsonResponse({"error": "Offer not found."}, status=404)
    
    return JsonResponse(offer, safe=False, status=200)

@csrf_exempt
@login_required
def user_operations(request):
    if request.method == "POST":
        data = json.loads(request.body)
        offer_id = data.get("offer_id")
        if not offer_id:
            return JsonResponse({"error": "Offer ID must be provided."}, status=400)
        
        offer = None
        try:
            offer = Offer.objects.get(pk=offer_id)
        except Offer.DoesNotExist:
            return JsonResponse({"error": "Offer not found."}, status=404)
        
        # should not be able to buy your own offer
        if offer.user_stock.user == request.user:
            return JsonResponse({"error": "You cannot buy your own offer."}, status=400)
        
        # check if user's available_balance is higher or equal to offer's price times quantity
        if request.user.available_balance < offer.price * offer.quantity:
            return JsonResponse({"error": "You don't have enough balance to buy this offer."}, status=400)
        
        # check if seller has enough quantity
        if offer.user_stock.quantity < offer.quantity:
            offer.canceled = True
            offer.save()
            return JsonResponse({"error": "Seller doesn't have enough quantity to sell this offer."}, status=400)
        
        offer.done = True
        offer.save()
        
        try:
            # create an operation from body data
            operation = Operation(
                buyer = request.user,
                offer = offer,
                date = datetime.now().date(),
            )
            operation.save()
        except:
            return JsonResponse({"error": "Operation already exists."}, status=400)
        
        # select user_stock from offer and if request.user has a user_stock with the same stock, update quantity, otherwise create a new user_stock
        user_stock_user = None
        try:
            user_stock_user = UserStock.objects.get(user=request.user, stock=offer.user_stock.stock)
        except UserStock.DoesNotExist:
            user_stock_user = UserStock(
                user = request.user,
                stock = offer.user_stock.stock,
                quantity = offer.quantity,
            )
        else:
            user_stock_user.quantity += offer.quantity
        
        user_stock_user.save()

        # update user available_balance
        request.user.available_balance -= offer.price * offer.quantity
        request.user.save()

        # delete user_stock from the user owner of the offer
        user_stock_seller = None
        try:
            user_stock_seller = UserStock.objects.get(user=offer.user_stock.user, stock=offer.user_stock.stock)
        except UserStock.DoesNotExist:
            pass
        else:
            user_stock_seller.quantity -= offer.quantity
            if user_stock_seller.quantity <= 0:
                user_stock_seller.delete()
            else:
                user_stock_seller.save()
        # update seller available_balance
        seller = offer.user_stock.user
        seller.available_balance += offer.price * offer.quantity
        seller.save()
        
        return JsonResponse(operation.serialize(), safe=False, status=201)
    # pick all operations from user
    operations = [x.serialize() for x in request.user.operations.order_by("-date").all()]
    return JsonResponse(operations, safe=False, status=200)

@login_required
def user_operation(request, operation_id):
    # pick operation from database
    operation = Operation.objects.get(pk=operation_id)
    return JsonResponse(operation.serialize(), safe=False, status=200)

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("stockmarket:index"))
        else:
            return render(request, "stockmarket/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "stockmarket/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("stockmarket:index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirm_password
        password = request.POST["password"]
        confirm_password = request.POST["confirm_password"]
        if password != confirm_password:
            return render(request, "stockmarket/register.html", {
                "message": "Passwords don't match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "stockmarket/register.html", {
                "message": "Username or Email already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("stockmarket:index"))
    else:
        return render(request, "stockmarket/register.html")
