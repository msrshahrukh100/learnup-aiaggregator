from django.urls import path
from .views import ProductListView, CreateOrderView, VerifyPaymentView

urlpatterns = [
    path('products/', ProductListView.as_view(), name='product-list'),
    path('create-order/', CreateOrderView.as_view(), name='create-order'),
    path('verify-payment/', VerifyPaymentView.as_view(), name='verify-payment'),
]
