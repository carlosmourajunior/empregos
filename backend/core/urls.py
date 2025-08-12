from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard_stats, name='dashboard_stats'),
    path('health/', views.health_check, name='health_check'),
]
