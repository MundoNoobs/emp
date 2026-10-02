from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.db import transaction

from pages.models import PerfilUsuario, Tienda


NEGOCIOS = [
    ('dona-rosa', 'Doña Rosa', 'Pastelería', 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=120&h=120&fit=crop'),
    ('el-telar', 'El Telar', 'Artesanía textil', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=120&h=120&fit=crop'),
    ('eco-pica', 'Eco Pica', 'Cosmética natural', 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=120&h=120&fit=crop'),
    ('tierra-norte', 'Tierra Norte', 'Cerámica', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=120&h=120&fit=crop'),
    ('tech-iquique', 'Tech Iquique', 'Reparaciones tech', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=120&h=120&fit=crop'),
    ('verde-hogar', 'Verde Hogar', 'Plantas y jardín', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=120&h=120&fit=crop'),
    ('sabores-norte', 'Sabores Norte', 'Comida regional', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=120&h=120&fit=crop'),
    ('la-cevicheria-iqq', 'La Cevichería IQQ', 'Mariscos', 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=120&h=120&fit=crop'),
    ('boutique-norte', 'Boutique Norte', 'Moda y diseño', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=120&h=120&fit=crop'),
    ('orfebreria-iqq', 'Orfebrería IQQ', 'Joyería plata', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=120&h=120&fit=crop'),
    ('bytenorte', 'ByteNorte', 'Computadores', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=120&h=120&fit=crop'),
    ('arte-pampa', 'Arte Pampa', 'Pintura y arte', 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=120&h=120&fit=crop'),
    ('foto-desierto', 'Foto Desierto', 'Fotografía', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=120&h=120&fit=crop'),
    ('fitnorte', 'FitNorte', 'Fitness y salud', 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=120&h=120&fit=crop'),
    ('iqq-print', 'IQQ Print', 'Impresión 3D', 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=120&h=120&fit=crop'),
    ('dulces-pampinos', 'Dulces Pampinos', 'Repostería', 'https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=120&h=120&fit=crop'),
    ('clases-norte', 'Clases Norte', 'Academia y clases', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=120&h=120&fit=crop'),
    ('estetica-nortina', 'Estética Nortina', 'Belleza y cuidado', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=120&h=120&fit=crop'),
    ('madera-atacamena', 'Madera Atacameña', 'Talla en madera', 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=120&h=120&fit=crop'),
    ('cibernorte', 'CiberNorte', 'Ciberseguridad', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=120&h=120&fit=crop'),
]


class Command(BaseCommand):
    help = 'Carga o actualiza los negocios de demostración de Emprende Iquique.'

    def handle(self, *args, **options):
        creados = 0
        actualizados = 0

        with transaction.atomic():
            for slug, nombre, categoria, imagen_url in NEGOCIOS:
                tienda = Tienda.objects.filter(nombre=nombre).first()
                if tienda:
                    tienda.categoria = categoria
                    tienda.imagen_url = imagen_url
                    tienda.save(update_fields=['categoria', 'imagen_url'])
                    actualizados += 1
                    continue

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
                Tienda.objects.create(
                    usuario=usuario,
                    nombre=nombre,
                    categoria=categoria,
                    imagen_url=imagen_url,
                )
                creados += 1

        self.stdout.write(self.style.SUCCESS(
            f'Negocios de demostración listos. Creados: {creados}; actualizados: {actualizados}.'
        ))