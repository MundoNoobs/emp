from django.urls import path

from . import views

urlpatterns = [
    path("", views.InicioView.as_view(), name="inicio"),
    path("gastronomia/", views.GastronomiaView.as_view(), name="gastronomia"),
    path("artesanias/", views.ArtesaniasView.as_view(), name="artesanias"),
    path("moda/", views.ModaView.as_view(), name="moda"),
    path("tecnologia/", views.TecnologiaView.as_view(), name="tecnologia"),
    path("servicios/", views.ServiciosView.as_view(), name="servicios"),
    path("nosotros/", views.NosotrosView.as_view(), name="nosotros"),
    path("contacto/", views.ContactoView.as_view(), name="contacto"),
    path("anexo-uso-ia/", views.AnexoUsoIAView.as_view(), name="anexo_uso_ia"),
    path("negocios/", views.lista_negocios, name="lista_negocios"),
    path("productos/", views.lista_productos, name="lista_productos"),
    path("api/carrito/", views.carrito_actual, name="carrito_actual"),
    path("api/carrito/modificar/", views.modificar_carrito, name="modificar_carrito"),
    path("api/checkout/", views.finalizar_compra, name="finalizar_compra"),
    path("registro/", views.registro, name="registro"),
    path("cerrar-sesion/", views.cerrar_sesion, name="cerrar_sesion"),
]
