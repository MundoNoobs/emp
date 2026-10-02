from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from .models import Tienda


class RegistroUsuarioForm(forms.Form):
    nombre = forms.CharField(max_length=150)
    email = forms.EmailField(max_length=150)
    password = forms.CharField(strip=False)
    confirmar_password = forms.CharField(strip=False)
    tipo_cuenta = forms.ChoiceField(choices=(('CLIENTE', 'Cliente'), ('TIENDA', 'Tienda')))

    def clean_email(self):
        email = self.cleaned_data['email'].strip()
        if User.objects.filter(email__iexact=email).exists() or User.objects.filter(username__iexact=email).exists():
            raise ValidationError('Ya existe una cuenta con ese correo.')
        return email

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        confirmation = cleaned_data.get('confirmar_password')

        if password and confirmation and password != confirmation:
            self.add_error('confirmar_password', 'Las contraseñas no coinciden.')
        if password:
            name_parts = cleaned_data.get('nombre', '').strip().split(maxsplit=1)
            user = User(
                username=cleaned_data.get('email', ''),
                first_name=name_parts[0] if name_parts else '',
                last_name=name_parts[1] if len(name_parts) > 1 else '',
            )
            try:
                validate_password(password, user=user)
            except ValidationError as error:
                self.add_error('password', error)
        return cleaned_data

    def save(self):
        name_parts = self.cleaned_data['nombre'].strip().split(maxsplit=1)
        user = User.objects.create_user(
            username=self.cleaned_data['email'],
            email=self.cleaned_data['email'],
            first_name=name_parts[0],
            last_name=name_parts[1] if len(name_parts) > 1 else '',
            password=self.cleaned_data['password'],
        )
        user.perfil.rol = self.cleaned_data['tipo_cuenta']
        user.perfil.save()
        if user.perfil.rol == 'TIENDA':
            Tienda.objects.create(usuario=user, nombre=self.cleaned_data['nombre'].strip())
        return user