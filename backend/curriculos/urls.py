from django.urls import path
from . import views

urlpatterns = [
    path('', views.CurriculoListCreateView.as_view(), name='curriculo_list_create'),
    path('<int:pk>/', views.CurriculoDetailView.as_view(), name='curriculo_detail'),
    path('meu/', views.meu_curriculo, name='meu_curriculo'),
    path('usuario/<int:user_id>/', views.curriculo_por_usuario, name='curriculo_por_usuario'),
    
    # Escolaridade
    path('<int:curriculo_id>/escolaridades/', views.EscolaridadeListCreateView.as_view(), name='escolaridade_list_create'),
    path('<int:curriculo_id>/escolaridades/<int:pk>/', views.EscolaridadeDetailView.as_view(), name='escolaridade_detail'),
    
    # Experiências
    path('<int:curriculo_id>/experiencias/', views.ExperienciaListCreateView.as_view(), name='experiencia_list_create'),
    path('<int:curriculo_id>/experiencias/<int:pk>/', views.ExperienciaDetailView.as_view(), name='experiencia_detail'),
    
    # Habilidades
    path('<int:curriculo_id>/habilidades/', views.HabilidadeListCreateView.as_view(), name='habilidade_list_create'),
    path('<int:curriculo_id>/habilidades/<int:pk>/', views.HabilidadeDetailView.as_view(), name='habilidade_detail'),
]
