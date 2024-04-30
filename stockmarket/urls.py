
from django.urls import path

from . import views

app_name = "stockmarket"

urlpatterns = [
    path("", views.index, name="index"),
    path("stocks", views.index, name="stocks_page"),
    path("dashboard", views.index, name="dashboard_page"),
    path("portfolio", views.index, name="portfolio_page"),
    path("api/v1/account", views.user, name="user"),
    path("api/v1/dashboard", views.dashboard, name="dashboard"),
    path("api/v1/stocks", views.stocks, name="stocks"),
    path("api/v1/portfolio", views.portfolio, name="portfolio"),
    path("api/v1/stocks/<int:stock_id>", views.stock, name="stock"),
    path("api/v1/stocks/<int:stock_id>/offers", views.stock_offers, name="stock_offers"),
    path("api/v1/stocks/<int:stock_id>/offers/<int:offer_id>", views.stock_offer, name="stock_offer"),
    path("api/v1/operations", views.user_operations, name="operations"),
    path("api/v1/operations/<int:operation_id>", views.user_operation, name="operation"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register")
]
