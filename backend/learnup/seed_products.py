import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'learnup.settings')
django.setup()

from payments.models import Product

def seed_products():
    products = [
        {
            'name': 'Basic Plan',
            'description': '1000 tokens per month',
            'amount': 99.00
        },
        {
            'name': 'Pro Plan',
            'description': '5000 tokens per month',
            'amount': 499.00
        },
        {
            'name': 'Enterprise Plan',
            'description': 'Unlimited tokens',
            'amount': 1999.00
        }
    ]

    for p_data in products:
        product, created = Product.objects.get_or_create(
            name=p_data['name'],
            defaults={'description': p_data['description'], 'amount': p_data['amount']}
        )
        if created:
            print(f"Created product: {product.name}")
        else:
            print(f"Product already exists: {product.name}")

if __name__ == '__main__':
    seed_products()
