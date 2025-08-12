from django.urls import path
from . import views

urlpatterns = [
    path('vagas-recomendadas/', views.VagasRecomendadasView.as_view(), name='vagas_recomendadas'),
    path('executar/<int:vaga_id>/', views.executar_matching_vaga, name='executar_matching_vaga'),
    path('estatisticas/', views.estatisticas_matching, name='estatisticas_matching'),
    path('historico/', views.HistoricoMatchingView.as_view(), name='historico_matching'),
    path('trabalhador/<int:trabalhador_id>/', views.detalhes_matching_trabalhador, name='detalhes_matching_trabalhador'),
]
