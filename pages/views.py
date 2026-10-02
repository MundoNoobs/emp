from decimal import Decimal
import json

from django.views.generic import TemplateView
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError, transaction
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from .forms import RegistroUsuarioForm
from .models import Carrito, DetalleVenta, ItemCarrito, Producto, Tienda, Venta

class InicioView(TemplateView):
    template_name = "pages/index.html"
    extra_context = {"active": "inicio"}

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['negocios_destacados'] = Tienda.objects.order_by('id')[:7]
        return context


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


@require_GET
def lista_negocios(request):
    negocios = list(Tienda.objects.order_by('id').values('nombre', 'categoria', 'imagen_url'))
    return JsonResponse({'negocios': negocios})


@require_GET
def lista_productos(request):
    productos = [{
        'id': producto.pk,
        'nombre': producto.nombre,
        'categoria': producto.categoria,
        'imagen_url': producto.imagen_url,
        'precio': str(producto.precio),
        'stock': producto.stock,
        'tienda': producto.tienda.nombre,
    } for producto in Producto.objects.select_related('tienda').order_by('id')]
    return JsonResponse({'productos': productos})


def _serializar_carrito(carrito):
    items = []
    total = Decimal('0.00')
    cantidad_total = 0
    for item in carrito.items.select_related('producto', 'producto__tienda').order_by('id'):
        subtotal = item.producto.precio * item.cantidad
        total += subtotal
        cantidad_total += item.cantidad
        items.append({
            'id': item.pk,
            'product_id': item.producto_id,
            'name': item.producto.nombre,
            'seller': item.producto.tienda.nombre,
            'img': item.producto.imagen_url,
            'price': str(item.producto.precio),
            'qty': item.cantidad,
            'line_total': str(subtotal),
        })
    return {'items': items, 'count': cantidad_total, 'total': str(total)}


@require_GET
def carrito_actual(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Inicia sesión para consultar tu carrito.'}, status=401)
    carrito, _ = Carrito.objects.get_or_create(usuario=request.user)
    return JsonResponse({'carrito': _serializar_carrito(carrito)})


@require_POST
def modificar_carrito(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Inicia sesión para modificar tu carrito.'}, status=401)

    carrito, _ = Carrito.objects.get_or_create(usuario=request.user)
    accion = request.POST.get('accion')
    resultado = {}
    try:
        with transaction.atomic():
            if accion == 'agregar':
                producto_id = int(request.POST.get('producto_id', ''))
                cantidad = int(request.POST.get('cantidad', '1'))
                producto = Producto.objects.select_for_update().get(pk=producto_id)
                item = ItemCarrito.objects.select_for_update().filter(
                    carrito=carrito, producto=producto
                ).first()
                nueva_cantidad = (item.cantidad if item else 0) + cantidad
                if cantidad < 1 or nueva_cantidad > producto.stock:
                    return JsonResponse({'error': 'No hay stock suficiente para esa cantidad.'}, status=400)
                if item:
                    item.cantidad = nueva_cantidad
                    item.save(update_fields=['cantidad'])
                else:
                    ItemCarrito.objects.create(carrito=carrito, producto=producto, cantidad=cantidad)
            elif accion == 'cantidad':
                item_id = int(request.POST.get('item_id', ''))
                cantidad = int(request.POST.get('cantidad', ''))
                item = ItemCarrito.objects.select_for_update().select_related('producto').get(
                    pk=item_id, carrito=carrito
                )
                if cantidad < 1:
                    item.delete()
                elif cantidad > item.producto.stock:
                    return JsonResponse({'error': 'No hay stock suficiente para esa cantidad.'}, status=400)
                else:
                    item.cantidad = cantidad
                    item.save(update_fields=['cantidad'])
            elif accion == 'quitar':
                item_id = int(request.POST.get('item_id', ''))
                ItemCarrito.objects.filter(pk=item_id, carrito=carrito).delete()
            elif accion == 'vaciar':
                carrito.items.all().delete()
            elif accion == 'importar':
                try:
                    productos_anteriores = json.loads(request.POST.get('items', '[]'))
                except json.JSONDecodeError:
                    return JsonResponse({'error': 'El carrito anterior no tiene un formato válido.'}, status=400)
                if not isinstance(productos_anteriores, list) or len(productos_anteriores) > 100:
                    return JsonResponse({'error': 'El carrito anterior no tiene un formato válido.'}, status=400)

                importados = 0
                omitidos = 0
                for anterior in productos_anteriores:
                    if not isinstance(anterior, dict):
                        omitidos += 1
                        continue
                    nombre = str(anterior.get('name', '')).strip()
                    vendedor = str(anterior.get('seller', '')).split('—', 1)[0].strip()
                    try:
                        cantidad = int(anterior.get('qty', 0))
                    except (TypeError, ValueError):
                        omitidos += 1
                        continue
                    if not nombre or not vendedor or cantidad < 1:
                        omitidos += 1
                        continue

                    producto = Producto.objects.select_for_update().filter(
                        nombre=nombre,
                        tienda__nombre__iexact=vendedor,
                    ).first()
                    if not producto or producto.stock < 1:
                        omitidos += 1
                        continue
                    item = ItemCarrito.objects.select_for_update().filter(
                        carrito=carrito, producto=producto
                    ).first()
                    cantidad_actual = item.cantidad if item else 0
                    cantidad_agregada = min(cantidad, producto.stock - cantidad_actual)
                    if cantidad_agregada < 1:
                        omitidos += 1
                        continue
                    if item:
                        item.cantidad += cantidad_agregada
                        item.save(update_fields=['cantidad'])
                    else:
                        ItemCarrito.objects.create(
                            carrito=carrito,
                            producto=producto,
                            cantidad=cantidad_agregada,
                        )
                    importados += 1
                resultado = {'importados': importados, 'omitidos': omitidos}
            else:
                return JsonResponse({'error': 'Acción de carrito no válida.'}, status=400)
    except (ValueError, Producto.DoesNotExist, ItemCarrito.DoesNotExist):
        return JsonResponse({'error': 'Producto o ítem de carrito no válido.'}, status=400)

    return JsonResponse({'ok': True, 'carrito': _serializar_carrito(carrito), **resultado})


@require_POST
def finalizar_compra(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Inicia sesión para finalizar la compra.'}, status=401)

    try:
        with transaction.atomic():
            carrito = Carrito.objects.select_for_update().get(usuario=request.user)
            items = list(
                ItemCarrito.objects.select_for_update()
                .filter(carrito=carrito)
                .order_by('producto_id')
            )
            if not items:
                return JsonResponse({'error': 'El carrito está vacío.'}, status=400)

            producto_ids = [item.producto_id for item in items]
            productos = {
                producto.pk: producto
                for producto in Producto.objects.select_for_update()
                .filter(pk__in=producto_ids)
                .order_by('pk')
            }
            for item in items:
                producto = productos[item.producto_id]
                if item.cantidad > producto.stock:
                    return JsonResponse({
                        'error': f'Stock insuficiente para {producto.nombre}.'
                    }, status=409)

            total = sum(
                (productos[item.producto_id].precio * item.cantidad for item in items),
                Decimal('0.00'),
            )
            venta = Venta.objects.create(usuario=request.user, total=total)
            detalles = []
            for item in items:
                producto = productos[item.producto_id]
                detalles.append(DetalleVenta(
                    venta=venta,
                    producto=producto,
                    cantidad=item.cantidad,
                    precio_unitario=producto.precio,
                ))
                producto.stock -= item.cantidad
                producto.save(update_fields=['stock'])
            DetalleVenta.objects.bulk_create(detalles)
            carrito.items.all().delete()
    except Carrito.DoesNotExist:
        return JsonResponse({'error': 'No existe un carrito para esta cuenta.'}, status=400)

    return JsonResponse({
        'ok': True,
        'venta': {
            'id': venta.pk,
            'total': str(venta.total),
            'estado': venta.estado,
            'detalles': [{
                'producto': productos[detalle.producto_id].nombre,
                'cantidad': detalle.cantidad,
                'precio_unitario': str(detalle.precio_unitario),
            } for detalle in detalles],
        },
    }, status=201)


@require_POST
def registro(request):
    if request.POST.get('accion') == 'login':
        email = request.POST.get('email', '').strip()
        usuario = authenticate(request, username=email, password=request.POST.get('password', ''))
        tipo_cuenta = request.POST.get('tipo_cuenta')
        if not usuario or not hasattr(usuario, 'perfil') or usuario.perfil.rol != tipo_cuenta:
            return JsonResponse({'errors': {'__all__': [{'message': 'Correo, contraseña o tipo de usuario incorrecto.'}]}}, status=400)
    else:
        form = RegistroUsuarioForm(request.POST)
        if not form.is_valid():
            return JsonResponse({'errors': form.errors.get_json_data()}, status=400)
        try:
            with transaction.atomic():
                usuario = form.save()
        except IntegrityError:
            return JsonResponse({'errors': {'email': [{'message': 'Ya existe una cuenta con ese correo.'}]}}, status=409)

    login(request, usuario)
    nombre = usuario.get_full_name() or usuario.username
    if request.POST.get('accion') != 'login':
        nombre = request.POST.get('nombre', '').strip()
    return JsonResponse({
        'ok': True,
        'user': {
            'id': usuario.pk,
            'nombre': nombre,
            'email': usuario.email,
            'rol': usuario.perfil.rol,
        },
    })


@require_POST
def cerrar_sesion(request):
    logout(request)
    return JsonResponse({'ok': True})