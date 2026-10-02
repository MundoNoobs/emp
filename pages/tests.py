import json
from io import StringIO

from django.contrib.auth.models import User
from django.core.management import call_command
from django.test import TestCase
from django.urls import reverse

from .models import Carrito, DetalleVenta, ItemCarrito, Producto, Tienda, Venta


class RegistroUsuarioTests(TestCase):
    def registro(self, tipo_cuenta):
        return self.client.post(reverse('registro'), {
            'accion': 'registro',
            'nombre': 'Emprendedor Local',
            'email': 'emprendedor@example.com',
            'password': 'ClaveSegura2026!',
            'confirmar_password': 'ClaveSegura2026!',
            'tipo_cuenta': tipo_cuenta,
        })

    def test_registro_cliente_crea_usuario_perfil_y_carrito(self):
        response = self.registro('CLIENTE')

        self.assertEqual(response.status_code, 200)
        usuario = User.objects.get(email='emprendedor@example.com')
        self.assertEqual(response.json()['user']['id'], usuario.pk)
        self.assertTrue(usuario.check_password('ClaveSegura2026!'))
        self.assertEqual(usuario.perfil.rol, 'CLIENTE')
        self.assertTrue(Carrito.objects.filter(usuario=usuario).exists())
        self.assertFalse(Tienda.objects.filter(usuario=usuario).exists())

    def test_registro_tienda_crea_tienda_asociada(self):
        response = self.registro('TIENDA')

        self.assertEqual(response.status_code, 200)
        usuario = User.objects.get(email='emprendedor@example.com')
        self.assertEqual(usuario.perfil.rol, 'TIENDA')
        self.assertEqual(usuario.tienda.nombre, 'Emprendedor Local')
        self.assertTrue(Carrito.objects.filter(usuario=usuario).exists())

    def test_registro_rechaza_correo_existente(self):
        User.objects.create_user(
            username='emprendedor@example.com',
            email='emprendedor@example.com',
            password='ClaveSegura2026!',
        )

        response = self.registro('CLIENTE')

        self.assertEqual(response.status_code, 400)
        self.assertEqual(User.objects.count(), 1)


class DirectorioNegociosTests(TestCase):
    def test_endpoint_devuelve_negocios_desde_la_base(self):
        usuario = User.objects.create_user(username='tienda-test', password='ClaveSegura2026!')
        Tienda.objects.create(
            usuario=usuario,
            nombre='Tienda de prueba',
            categoria='Artesanía',
            imagen_url='https://example.com/tienda.jpg',
        )

        response = self.client.get(reverse('lista_negocios'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['negocios'], [{
            'nombre': 'Tienda de prueba',
            'categoria': 'Artesanía',
            'imagen_url': 'https://example.com/tienda.jpg',
        }])

    def test_carga_de_negocios_demo_es_idempotente(self):
        call_command('cargar_negocios_demo', stdout=StringIO())
        call_command('cargar_negocios_demo', stdout=StringIO())

        self.assertEqual(Tienda.objects.count(), 20)


class EcommercePersistenceTests(TestCase):
    def setUp(self):
        self.usuario = User.objects.create_user(
            username='cliente-test',
            email='cliente@example.com',
            password='ClaveSegura2026!',
        )
        self.tienda = Tienda.objects.create(usuario=self.usuario, nombre='Tienda Test')
        self.producto = Producto.objects.create(
            tienda=self.tienda,
            nombre='Producto Test',
            descripcion='Producto para prueba',
            precio='1250.00',
            stock=5,
        )
        self.client.force_login(self.usuario)

    def test_carrito_persiste_cantidades_y_precio_de_base(self):
        response = self.client.post(reverse('modificar_carrito'), {
            'accion': 'agregar',
            'producto_id': self.producto.pk,
            'cantidad': 2,
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['carrito']['total'], '2500.00')
        self.assertEqual(ItemCarrito.objects.get().cantidad, 2)

    def test_importa_carrito_anterior_sin_confiar_en_su_precio(self):
        response = self.client.post(reverse('modificar_carrito'), {
            'accion': 'importar',
            'items': json.dumps([{
                'name': 'Producto Test',
                'seller': 'Tienda Test — Categoría local',
                'price': 1,
                'qty': 2,
            }]),
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['carrito']['total'], '2500.00')
        self.assertEqual(response.json()['importados'], 1)

    def test_checkout_crea_venta_detalle_y_descuenta_stock(self):
        carrito = self.usuario.carrito
        agregar = self.client.post(reverse('modificar_carrito'), {
            'accion': 'agregar',
            'producto_id': self.producto.pk,
            'cantidad': 2,
        })
        self.assertEqual(agregar.status_code, 200)

        response = self.client.post(reverse('finalizar_compra'))

        self.assertEqual(response.status_code, 201)
        venta = Venta.objects.get(usuario=self.usuario)
        detalle = DetalleVenta.objects.get(venta=venta)
        self.assertEqual(venta.total, 2500)
        self.assertEqual(detalle.producto, self.producto)
        self.assertEqual(detalle.cantidad, 2)
        self.assertEqual(detalle.precio_unitario, 1250)
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.stock, 3)
        self.assertFalse(carrito.items.exists())

    def test_stock_insuficiente_no_registra_venta_ni_vacia_carrito(self):
        carrito = self.usuario.carrito
        ItemCarrito.objects.create(carrito=carrito, producto=self.producto, cantidad=6)

        response = self.client.post(reverse('finalizar_compra'))

        self.assertEqual(response.status_code, 409)
        self.assertFalse(Venta.objects.exists())
        self.assertTrue(carrito.items.exists())
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.stock, 5)

    def test_checkout_requiere_sesion(self):
        self.client.logout()

        response = self.client.post(reverse('finalizar_compra'))

        self.assertEqual(response.status_code, 401)

    def test_catalogo_demo_importa_tarjetas_y_es_idempotente(self):
        call_command('sincronizar_catalogo_demo', stdout=StringIO())
        cantidad_inicial = Producto.objects.count()
        call_command('sincronizar_catalogo_demo', stdout=StringIO())

        self.assertGreater(cantidad_inicial, 0)
        self.assertEqual(Producto.objects.count(), cantidad_inicial)
