from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserTokenBalance

@receiver(post_save, sender=User)
def create_user_token_balance(sender, instance, created, **kwargs):
    """
    Automatically create a UserTokenBalance for every new user.
    """
    if created:
        # Check if balance already exists to be safe
        UserTokenBalance.objects.get_or_create(user=instance, defaults={'balance': 1000.0000})
