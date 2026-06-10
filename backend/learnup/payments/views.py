import razorpay
from django.conf import settings
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Product, Order
from chat.models import UserTokenBalance, UserTokenTransaction

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

class ProductListView(APIView):
    def get(self, request):
        products = Product.objects.all()
        # Ensure products have token info in response if needed
        return Response({
            'products': [
                {
                    'id': p.id,
                    'name': p.name,
                    'description': p.description,
                    'amount': p.amount,
                    'currency': p.currency,
                    'tokens': p.tokens
                } for p in products
            ]
        })

class CreateOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        product_id = request.data.get('product_id')
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        # Amount in paise (1 INR = 100 paise)
        amount = int(product.amount * 100)
        data = {
            'amount': amount,
            'currency': product.currency,
            'payment_capture': '1'  # 1 for auto capture, 0 for manual
        }

        try:
            razorpay_order = client.order.create(data=data)
            
            # Save user if authenticated
            user = request.user if request.user.is_authenticated else None
            
            order = Order.objects.create(
                product=product,
                user=user,
                razorpay_order_id=razorpay_order['id'],
                amount=product.amount,
                status='pending'
            )
            return Response({
                'order_id': razorpay_order['id'],
                'amount': amount,
                'currency': product.currency,
                'key_id': settings.RAZORPAY_KEY_ID,
                'product_name': product.name,
                'product_description': product.description
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class VerifyPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        # Support both standard and custom parameter names
        razorpay_order_id = request.data.get('razorpay_order_id') or request.data.get('order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id') or request.data.get('payment_id')
        razorpay_signature = request.data.get('razorpay_signature') or request.data.get('signature')

        params_dict = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        }

        try:
            # Verify the signature
            client.utility.verify_payment_signature(params_dict)
            
            with transaction.atomic():
                # Update order status
                order = Order.objects.get(razorpay_order_id=razorpay_order_id)
                order.razorpay_payment_id = razorpay_payment_id
                order.razorpay_signature = razorpay_signature
                order.status = 'success'
                order.save()
                
                # If order has a user, credit tokens
                if order.user:
                    balance, created = UserTokenBalance.objects.get_or_create(
                        user=order.user,
                        defaults={'balance': 0}
                    )
                    balance.balance += order.product.tokens
                    balance.save()
                    
                    # Record transaction
                    UserTokenTransaction.objects.create(
                        user=order.user,
                        amount=order.product.tokens,
                        transaction_type='purchase',
                        description=f"Token purchase: {order.product.name} (Order: {order.razorpay_order_id})"
                    )
            
            return Response({'status': 'Payment verified successfully'}, status=status.HTTP_200_OK)
        except razorpay.errors.SignatureVerificationError:
            return Response({'error': 'Invalid payment signature'}, status=status.HTTP_400_BAD_REQUEST)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
