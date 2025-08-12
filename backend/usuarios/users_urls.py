from django.urls import path
from . import views

# URLs específicas para gerenciamento de usuários (diferentes das de autenticação)
urlpatterns = [
    path('', views.ListaUsuariosView.as_view(), name='lista_usuarios'),
    path('criar/', views.CriarCandidatoView.as_view(), name='criar_candidato'),
    path('<int:pk>/aprovar/', views.AprovarUsuarioView.as_view(), name='aprovar_usuario'),
    path('empresas/', views.EmpresasView.as_view(), name='empresas'),
    path('trabalhadores/', views.TrabalhadoresView.as_view(), name='trabalhadores'),
]
