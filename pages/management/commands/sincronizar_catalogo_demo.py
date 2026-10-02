from decimal import Decimal
from html.parser import HTMLParser

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.db import transaction
from django.template.loader import get_template
from django.utils.text import slugify

from pages.models import PerfilUsuario, Producto, Tienda


PLANTILLAS_CATALOGO = (
    'pages/index.html',
    'pages/gastronomia.html',
    'pages/artesanias.html',
    'pages/moda.html',
    'pages/tecnologia.html',
    'pages/servicios.html',
)


class ProductCardParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.cards = []
        self.card = None
        self.capture = None

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        classes = attributes.get('class', '').split()
        if tag == 'article' and 'product-card' in classes:
            self.card = {'text': {}}
            return
        if not self.card:
            return
        if tag == 'img' and 'prod-img' in classes:
            self.card['imagen_url'] = attributes.get('src', '')
        fields = {'title': 'nombre', 'price': 'precio', 'seller': 'vendedor'}
        for class_name, field_name in fields.items():
            if class_name in classes:
                self.capture = {'tag': tag, 'field': field_name, 'parts': []}
                break

    def handle_data(self, data):
        if self.capture:
            self.capture['parts'].append(data)

    def handle_endtag(self, tag):
        if self.capture and self.capture['tag'] == tag:
            field = self.capture['field']
            self.card[field] = ''.join(self.capture['parts']).strip()
            self.capture = None
        if tag == 'article' and self.card:
            self.cards.append(self.card)
            self.card = None


def catalog_products():
    products = []
    for template_name in PLANTILLAS_CATALOGO:
        rendered = get_template(template_name).render({'csrf_token': 'NOTPROVIDED'})
        parser = ProductCardParser()
        parser.feed(rendered)
        for card in parser.cards:
            seller_parts = card.get('vendedor', '').split('—', 1)
            digits = ''.join(character for character in card.get('precio', '') if character.isdigit())
            if not card.get('nombre') or not digits or not seller_parts[0].strip():
                continue
            products.append({
                'nombre': card['nombre'],
                'vendedor': seller_parts[0].strip(),
                'categoria': seller_parts[1].strip() if len(seller_parts) > 1 else '',
                'precio': Decimal(digits),
                'imagen_url': card.get('imagen_url', ''),
            })
    return products


class Command(BaseCommand):
    help = 'Sincroniza los productos mostrados en las páginas con la base de datos.'

    def handle(self, *args, **options):
        creados = 0
        actualizados = 0
        tiendas_creadas = 0
        with transaction.atomic():
            for data in catalog_products():
                tienda = Tienda.objects.filter(nombre=data['vendedor']).first()
                if not tienda:
                    slug = slugify(data['vendedor']) or 'emprendedor'
                    username = f'demo_{slug}'
                    suffix = 2
                    while User.objects.filter(username=username).exists():
                        username = f'demo_{slug}_{suffix}'
                        suffix += 1
                    usuario = User.objects.create_user(
                        username=username,
                        email=f'{username}@example.invalid',
                        password=None,
                    )
                    PerfilUsuario.objects.filter(usuario=usuario).update(rol='TIENDA')
                    tienda = Tienda.objects.create(
                        usuario=usuario,
                        nombre=data['vendedor'],
                        categoria=data['categoria'],
                        imagen_url=data['imagen_url'],
                    )
                    tiendas_creadas += 1
                elif not tienda.imagen_url or not tienda.categoria:
                    if not tienda.imagen_url:
                        tienda.imagen_url = data['imagen_url']
                    if not tienda.categoria:
                        tienda.categoria = data['categoria']
                    tienda.save(update_fields=['imagen_url', 'categoria'])

                defaults = {
                    'descripcion': data['nombre'],
                    'categoria': data['categoria'],
                    'imagen_url': data['imagen_url'],
                    'precio': data['precio'],
                }
                producto, creado = Producto.objects.get_or_create(
                    tienda=tienda,
                    nombre=data['nombre'],
                    defaults={**defaults, 'stock': 100},
                )
                if creado:
                    creados += 1
                else:
                    for field, value in defaults.items():
                        setattr(producto, field, value)
                    producto.save(update_fields=list(defaults))
                    actualizados += 1

        self.stdout.write(self.style.SUCCESS(
            f'Catálogo listo. Productos creados: {creados}; actualizados: {actualizados}; '
            f'tiendas adicionales: {tiendas_creadas}.'
        ))