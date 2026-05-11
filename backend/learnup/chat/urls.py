from django.urls import path
from .views import chat_view, get_models_view, get_chats_view, get_chat_messages_view

urlpatterns = [
    path('', chat_view, name='chat'),
    path('models/', get_models_view, name='models'),
    path('list/', get_chats_view, name='chat_list'),
    path('<int:chat_id>/messages/', get_chat_messages_view, name='chat_messages'),
]

