from django.urls import path

from . import views

urlpatterns = [
    path("vagas/", views.VagasView.as_view()),
    path("vagas/<int:pk>/", views.VagaView.as_view()),
    path("vagas/<int:pk>/interesse/", views.InteresseView.as_view()),
    path("meus-interesses/", views.MeusInteressesView.as_view()),
    path("minhas-vagas/", views.MinhasVagasView.as_view()),
    path("minhas-vagas/<int:pk>/", views.MinhaVagaView.as_view()),
    path("minhas-vagas/<int:pk>/encerrar/", views.encerrar_vaga),
    path("minhas-vagas/<int:pk>/interessados/", views.InteressadosView.as_view()),
    path("sugestoes/", views.sugestoes),
]
