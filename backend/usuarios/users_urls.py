from django.urls import path
from . import views

# URLs específicas para gerenciamento de usuários (diferentes das de autenticação)
urlpatterns = [
    path('', views.ListaUsuariosView.as_view(), name='lista_usuarios'),
    path('criar/', views.CriarCandidatoView.as_view(), name='criar_candidato'),
    path('candidato/criar/', views.CriarCandidatoView.as_view(), name='criar_candidato_admin'),
    path('candidato/criar-completo/', views.CriarCandidatoCompletoView.as_view(), name='criar_candidato_completo'),
    path('<int:pk>/candidato/', views.EditarCandidatoView.as_view(), name='editar_candidato'),
    path('<int:user_id>/perfil-trabalhador/', views.PerfilTrabalhadorDetailView.as_view(), name='perfil_trabalhador_detail'),
    path('empresa/criar/', views.CriarEmpresaView.as_view(), name='criar_empresa'),
    path('<int:pk>/empresa/', views.EditarEmpresaView.as_view(), name='editar_empresa'),
    path('<int:user_id>/perfil-empresa/', views.PerfilEmpresaDetailView.as_view(), name='perfil_empresa_detail'),
    path('<int:pk>/aprovar/', views.AprovarUsuarioView.as_view(), name='aprovar_usuario'),
    path('empresas/', views.EmpresasView.as_view(), name='empresas'),
    path('trabalhadores/', views.TrabalhadoresView.as_view(), name='trabalhadores'),
]
