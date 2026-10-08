from django.http import JsonResponse
from django.urls import include, path


def saude(request):
    return JsonResponse({"ok": True})


urlpatterns = [
    path("api/saude/", saude),
    path("api/auth/", include("apps.contas.urls")),
]
