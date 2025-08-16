from django.shortcuts import render

def index(request):
    return render(request, 'index.html')

def sobre(request):
    return render(request, 'sobre.html')

def contato(request):
    return render(request, 'contato.html')

def receitas(request):
    return render(request, 'receitas.html')

def alimentacao(request):
    return render(request, 'alimentacao.html')

