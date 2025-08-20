from django.core.mail import send_mail
from django.shortcuts import render, redirect
from django.contrib import messages
from django.conf import settings

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

def contato(request):
    if request.method == "POST":
        nome = request.POST.get("nome")
        email = request.POST.get("email")
        mensagem = request.POST.get("mensagem")

        if nome and email and mensagem:
            assunto = f"Mensagem do site Vita+ - {nome}"
            corpo = f"Nome: {nome}\nEmail: {email}\n\nMensagem:\n{mensagem}"

            try:
                send_mail(
                    assunto,
                    corpo,
                    settings.EMAIL_HOST_USER,           # remetente (seu e-mail configurado)
                    ["yumadesignergraf@gmail.com"],     # destinatário de teste
                    reply_to=[email],                   # e-mail do visitante
                )
                messages.success(request, "Mensagem enviada com sucesso! Em breve entraremos em contato.")
            except Exception as e:
                print(e)
                messages.error(request, "Ocorreu um erro ao enviar sua mensagem. Tente novamente.")
        else:
            messages.error(request, "Preencha todos os campos.")

        return redirect("contato")

    return render(request, "contato.html")