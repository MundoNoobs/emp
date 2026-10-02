from django.contrib import admin
from .models import PerfilUsuario, Tienda, Producto, Carrito, ItemCarrito, Venta, DetalleVenta

# Configuración visual para el panel de administración
class PerfilUsuarioAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'rol', 'fecha_creacion')
    list_filter = ('rol',)

class ProductoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'tienda', 'precio', 'stock')
    list_filter = ('tienda',)
    search_fields = ('nombre',)

# Registrar los modelos
admin.site.register(PerfilUsuario, PerfilUsuarioAdmin)
admin.site.register(Tienda)
admin.site.register(Producto, ProductoAdmin)
admin.site.register(Carrito)
admin.site.register(ItemCarrito)
admin.site.register(Venta)
admin.site.register(DetalleVenta)