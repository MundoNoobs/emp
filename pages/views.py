from django.views.generic import TemplateView
from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.contrib import messages
from requests import request
from .forms import RegistroUsuarioForm
from .models import Tienda

class InicioView(TemplateView):
    template_name = "pages/index.html"
    extra_context = {"active": "inicio"}


class GastronomiaView(TemplateView):
    template_name = "pages/gastronomia.html"
    extra_context = {"active": "gastronomia"}


class ArtesaniasView(TemplateView):
    template_name = "pages/artesanias.html"
    extra_context = {"active": "artesanias"}


class ModaView(TemplateView):
    template_name = "pages/moda.html"
    extra_context = {"active": "moda"}


class TecnologiaView(TemplateView):
    template_name = "pages/tecnologia.html"
    extra_context = {"active": "tecnologia"}


class ServiciosView(TemplateView):
    template_name = "pages/servicios.html"
    extra_context = {"active": "servicios"}


class NosotrosView(TemplateView):
    template_name = "pages/nosotros.html"
    extra_context = {"active": "nosotros"}


class ContactoView(TemplateView):
    template_name = "pages/contacto.html"
    extra_context = {"active": "contacto"}


class AnexoUsoIAView(TemplateView):
    template_name = "pages/anexo_uso_ia.html"

def index(request):
    if request.method == 'POST':
        # Capturamos el input oculto para saber qué formulario envió el modal
        accion = request.POST.get('accion')

        if accion == 'registro':
            form = RegistroUsuarioForm(request.POST)
            if form.is_valid():
                # 1. Guardar y encriptar contraseña
                usuario = form.save(commit=False)
                usuario.set_password(form.cleaned_data['password'])
                usuario.save() # Los Signals crean el Perfil y Carrito aquí

                # 2. Asignar rol
                tipo_cuenta = request.POST.get('tipo_cuenta', 'CLIENTE')
                usuario.perfil.rol = tipo_cuenta
                usuario.perfil.save()

                # 3. Crear Tienda si aplica
                if tipo_cuenta == 'TIENDA':
                    Tienda.objects.create(usuario=usuario, nombre=f"Tienda de {usuario.username}")

                # 4. Autenticar y recargar la página principal
                login(request, usuario)
                messages.success(request, f"¡Bienvenido {usuario.username}! Tu cuenta ha sido creada.")
                return redirect('index')
            else:
                # Si las contraseñas no coinciden o el usuario ya existe
                for error in form.errors.values():
                    messages.error(request, error)
                
        elif accion == 'login':
            # Aquí irá tu lógica futura para el modal de inicio de sesión
            pass 

    # Si entra normalmente a la página (GET), solo renderizamos el index
    return render(request, 'pages/index.html')