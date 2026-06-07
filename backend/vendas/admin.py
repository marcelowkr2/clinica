from django.contrib import admin
from .models import Venda, ItemVenda


class ItemVendaInline(admin.TabularInline):
    model = ItemVenda
    extra = 1
    readonly_fields = ('subtotal',)


@admin.register(Venda)
class VendaAdmin(admin.ModelAdmin):
    list_display = ('numero_venda', 'cliente_nome', 'data_venda', 'total', 'status', 'forma_pagamento')
    list_filter = ('status', 'forma_pagamento', 'data_venda')
    search_fields = ('numero_venda', 'cliente_nome', 'cliente_telefone', 'cliente_email')
    readonly_fields = ('created_at', 'updated_at', 'subtotal')
    inlines = [ItemVendaInline]
    
    fieldsets = (
        ('Informações da Venda', {
            'fields': ('numero_venda', 'data_venda', 'status', 'forma_pagamento')
        }),
        ('Dados do Cliente', {
            'fields': ('cliente_nome', 'cliente_telefone', 'cliente_email')
        }),
        ('Valores', {
            'fields': ('subtotal', 'desconto', 'total')
        }),
        ('Observações', {
            'fields': ('observacoes',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ItemVenda)
class ItemVendaAdmin(admin.ModelAdmin):
    list_display = ('venda', 'produto', 'quantidade', 'preco_unitario', 'subtotal')
    list_filter = ('venda__data_venda', 'produto__categoria')
    search_fields = ('venda__numero_venda', 'produto__nome', 'produto__codigo')
    readonly_fields = ('subtotal',)