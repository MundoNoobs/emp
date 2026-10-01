from django.views.generic import TemplateView


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
