from django.urls import path

from . import views

urlpatterns = [
    path("numeros/", views.numeros),
    path("vagas/", views.VagasPainelView.as_view()),
    path("vagas/<int:pk>/", views.VagaPainelView.as_view()),
    path("vagas/avaliar/", views.avaliar_vagas),
    path("empresas/", views.EmpresasView.as_view()),
    path("empresas/<int:pk>/", views.EmpresaPainelView.as_view()),
    path("candidatos/", views.CandidatosView.as_view()),
    path("candidatos/<int:pk>/", views.CandidatoPainelView.as_view()),
    path("empresas/<int:pk>/bloquear/", views.bloquear_empresa),
    path("equipe/", views.EquipeView.as_view()),
    path("equipe/<int:pk>/", views.remover_da_equipe),
    path("exportar/<str:tipo>/", views.exportar),
]
