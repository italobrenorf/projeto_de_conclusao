from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('sobre.html', views.sobre, name='sobre'),
    path('contato.html', views.contato, name='contato'),
    path('receitas.html', views.receitas, name='receitas'),
    path('alimentacao.html', views.alimentacao, name='alimentacao'),
]
