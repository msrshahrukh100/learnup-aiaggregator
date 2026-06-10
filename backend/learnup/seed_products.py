import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'learnup.settings')
django.setup()

from payments.models import Product

def seed_products():
    products = [
        {
            'name': 'Basic Plan',
            'description': '1000 tokens',
            'amount': 99.00,
            'tokens': 1000
        },
        {
            'name': 'Pro Plan',
            'description': '5000 tokens',
            'amount': 499.00,
            'tokens': 5000
        },
        {
            'name': 'Enterprise Plan',
            'description': '25000 tokens',
            'amount': 1999.00,
            'tokens': 25000
        }
    ]

    for p_data in products:
        product, created = Product.objects.update_or_create(
            name=p_data['name'],
            defaults={
                'description': p_data['description'], 
                'amount': p_data['amount'],
                'tokens': p_data['tokens']
            }
        )
        if created:
            print(f"Created product: {product.name}")
        else:
            print(f"Updated product: {product.name}")

if __name__ == '__main__':
    seed_products()
