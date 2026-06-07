from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User  # ou seu custom user model

admin.site.register(User, UserAdmin)
