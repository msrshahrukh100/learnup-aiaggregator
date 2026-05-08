from django.contrib import admin
from .models import Chat, ChatMessage, UserTokenBalance, UserTokenTransaction

@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'created_at', 'updated_at')
    search_fields = ('title', 'user__username')
    list_filter = ('created_at', 'updated_at')

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('chat', 'role', 'created_at')
    search_fields = ('content', 'chat__title')
    list_filter = ('role', 'created_at')

@admin.register(UserTokenBalance)
class UserTokenBalanceAdmin(admin.ModelAdmin):
    list_display = ('user', 'balance', 'updated_at')
    search_fields = ('user__username',)

@admin.register(UserTokenTransaction)
class UserTokenTransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'transaction_type', 'created_at')
    search_fields = ('user__username', 'description')
    list_filter = ('transaction_type', 'created_at')
