from django import forms
from django.contrib.auth.models import User
from .models import PerfilUsuario

class RegistroUsuarioForm(forms.ModelForm):
    # Campos adicionales que no están directamente en el modelo User
    password = forms.CharField(widget=forms.PasswordInput(), label="Contraseña")
    confirmar_password = forms.CharField(widget=forms.PasswordInput(), label="Confirmar Contraseña")
    
    # Campo para seleccionar el rol al registrarse (Cliente o Tienda)
    TIPO_CUENTA = (
        ('CLIENTE', 'Soy Cliente'),
        ('TIENDA', 'Soy Emprendedor (Tienda)'),
    )
    tipo_cuenta = forms.ChoiceField(choices=TIPO_CUENTA, widget=forms.RadioSelect, initial='CLIENTE')

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name']

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        confirmar_password = cleaned_data.get("confirmar_password")

        if password != confirmar_password:
            raise forms.ValidationError("Las contraseñas no coinciden. Por favor, verifícalas.")
        return cleaned_data