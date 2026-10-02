from django.views.generic import TemplateView
from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.contrib import messages
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

def registro(request):
    if request.method == 'POST':
        form = RegistroUsuarioForm(request.POST)
        if form.is_valid():
            # 1. Guardar el usuario base pero sin confirmar (commit=False) para encriptar la contraseña
            usuario = form.save(commit=False)
            usuario.set_password(form.cleaned_data['password'])
            usuario.save() # Aquí se dispara la Signal (crea Perfil 'CLIENTE' y Carrito)

            # 2. Actualizar el rol en el Perfil según la selección del usuario
            tipo_cuenta = form.cleaned_data.get('tipo_cuenta')
            usuario.perfil.rol = tipo_cuenta
            usuario.perfil.save()

            # 3. Si eligió ser Emprendedor, le creamos su Tienda inicial
            if tipo_cuenta == 'TIENDA':
                Tienda.objects.create(
                    usuario=usuario,
                    nombre=f"Tienda de {usuario.username}"
                )

            # 4. Iniciar sesión automáticamente después del registro
            login(request, usuario)
            messages.success(request, f"¡Bienvenido {usuario.username}! Tu cuenta ha sido creada exitosamente.")
            
            # Redirigir a la página de inicio (asegúrate de que el nombre 'index' coincida con tu urls.py)
            return redirect('index') 
    else:
        form = RegistroUsuarioForm()

    return render(request, 'pages/registro.html', {'form': form})