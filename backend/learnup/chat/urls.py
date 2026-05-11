from django.urls import path
from .views import chat_view, get_models_view

urlpatterns = [
    path('', chat_view, name='chat'),
    path('models/', get_models_view, name='models'),
]
