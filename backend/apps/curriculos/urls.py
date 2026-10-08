from django.urls import path

from . import views

urlpatterns = [path("", views.MeuCurriculoView.as_view())]
