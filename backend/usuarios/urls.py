from django.urls import path
from . import views

urlpatterns = [
    path('registro/empresa/', views.RegistroEmpresaView.as_view(), name='registro_empresa'),
    path('registro/trabalhador/', views.RegistroTrabalhadorView.as_view(), name='registro_trabalhador'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('perfil/', views.perfil_view, name='perfil'),
    path('', views.ListaUsuariosView.as_view(), name='lista_usuarios'),
    path('<int:pk>/aprovar/', views.AprovarUsuarioView.as_view(), name='aprovar_usuario'),
    path('candidato/criar/', views.CriarCandidatoView.as_view(), name='criar_candidato'),
    path('<int:pk>/candidato/', views.EditarCandidatoView.as_view(), name='editar_candidato'),
    path('<int:user_id>/perfil-trabalhador/', views.PerfilTrabalhadorDetailView.as_view(), name='perfil_trabalhador_detail'),
    path('empresa/criar/', views.CriarEmpresaView.as_view(), name='criar_empresa'),
    path('<int:pk>/empresa/', views.EditarEmpresaView.as_view(), name='editar_empresa'),
    path('<int:user_id>/perfil-empresa/', views.PerfilEmpresaDetailView.as_view(), name='perfil_empresa_detail'),
    path('empresas/', views.EmpresasView.as_view(), name='empresas'),
    path('trabalhadores/', views.TrabalhadoresView.as_view(), name='trabalhadores'),
]
