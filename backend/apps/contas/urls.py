from django.urls import path

from . import views

urlpatterns = [
    path("csrf/", views.CsrfView.as_view()),
    path("cadastro/", views.CadastroView.as_view()),
    path("enviar-codigo/", views.EnviarCodigoView.as_view()),
    path("verificar-codigo/", views.VerificarCodigoView.as_view()),
    path("login/", views.LoginView.as_view()),
    path("logout/", views.LogoutView.as_view()),
    path("eu/", views.EuView.as_view()),
]
