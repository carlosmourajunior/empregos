from django.urls import path
from . import views

urlpatterns = [
    path('', views.VagaListCreateView.as_view(), name='vaga_list_create'),
    path('<int:pk>/', views.VagaDetailView.as_view(), name='vaga_detail'),
    path('<int:vaga_id>/candidatar/', views.candidatar_vaga, name='candidatar_vaga'),
    path('<int:vaga_id>/candidatos/', views.candidatos_vaga, name='candidatos_vaga'),
    path('<int:vaga_id>/top-candidatos/', views.top_candidatos_vaga, name='top_candidatos_vaga'),
    path('candidaturas/<int:candidatura_id>/status/', views.atualizar_status_candidatura, name='atualizar_status_candidatura'),
    path('minhas-candidaturas/', views.minhas_candidaturas, name='minhas_candidaturas'),
    path('empresa/<int:empresa_id>/', views.VagasEmpresaView.as_view(), name='vagas_empresa'),
]
