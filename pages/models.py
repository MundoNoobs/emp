from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# =======================================================
# 4. TUS MODELOS ACTUALES AQUÍ (Mantenlos intactos)
# =======================================================
# class TuModeloExistente(models.Model):
#     ...

# =======================================================
# 3. ROLES DE USUARIO (Extensión del modelo User de Django)
# =======================================================
class PerfilUsuario(models.Model):
    ROLES = (
        ('ADMIN', 'Administrador'),
        ('TIENDA', 'Tienda / Emprendedor'),
        ('CLIENTE', 'Cliente'),
    )
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    rol = models.CharField(max_length=15, choices=ROLES, default='CLIENTE')
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.usuario.username} - {self.get_rol_display()}"

# =======================================================
# 2. MODELO DE TIENDAS
# =======================================================
class Tienda(models.Model):
    # Relación 1 a 1: Un usuario emprendedor tiene una tienda
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, limit_choices_to={'perfil__rol': 'TIENDA'})
    nombre = models.CharField(max_length=100)
    categoria = models.CharField(max_length=100, blank=True)
    imagen_url = models.URLField(blank=True)
    descripcion = models.TextField(blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre

# =======================================================
# 5. MÓDULOS DE COMERCIO (Productos, Carrito, Ventas)
# =======================================================
class Producto(models.Model):
    tienda = models.ForeignKey(Tienda, on_delete=models.CASCADE, related_name='productos')
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField()
    categoria = models.CharField(max_length=100, blank=True)
    imagen_url = models.CharField(max_length=500, blank=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre

class Carrito(models.Model):
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='carrito')
    fecha_creacion = models.DateTimeField(auto_now_add=True)

class ItemCarrito(models.Model):
    carrito = models.ForeignKey(Carrito, on_delete=models.CASCADE, related_name='items')
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField(default=1)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['carrito', 'producto'], name='unique_product_per_cart'),
        ]

class Venta(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.RESTRICT, related_name='compras')
    fecha = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    estado = models.CharField(max_length=50, default='Pendiente')

class DetalleVenta(models.Model):
    venta = models.ForeignKey(Venta, on_delete=models.CASCADE, related_name='detalles')
    producto = models.ForeignKey(Producto, on_delete=models.RESTRICT)
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)


# =======================================================
# 1. AUTOMATIZACIÓN MEDIANTE SIGNALS (Disparadores)
# =======================================================
@receiver(post_save, sender=User)
def crear_perfil_y_carrito(sender, instance, created, **kwargs):
    """
    Se ejecuta automáticamente cuando se guarda un User en la base de datos.
    Si es un usuario nuevo (created=True), se le asigna su perfil, permisos base y su carrito.
    """
    if created:
        # Crea el perfil base (Por defecto será 'CLIENTE')
        perfil = PerfilUsuario.objects.create(usuario=instance)
        
        # Si el usuario es superuser (el que creaste en terminal), lo hacemos ADMIN automáticamente
        if instance.is_superuser:
            perfil.rol = 'ADMIN'
            perfil.save()
            
        # Todo usuario creado recibe un carrito de compras automáticamente
        Carrito.objects.create(usuario=instance)

@receiver(post_save, sender=User)
def guardar_perfil_y_carrito(sender, instance, **kwargs):
    """Guarda los cambios del perfil y carrito si el usuario se actualiza."""
    instance.perfil.save()
    instance.carrito.save()