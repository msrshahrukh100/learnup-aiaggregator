from django.contrib.auth.models import User
from django.http import JsonResponse
import json


def parse_json_request(request):
    """Parse JSON request body and return data or error response."""
    try:
        return json.loads(request.body), None
    except json.JSONDecodeError:
        return None, JsonResponse({
            'success': False,
            'error': 'Invalid JSON format'
        }, status=400)


def validate_credentials(email, password, check_password_length=False):
    """
    Validate email and password.
    Returns (True, None) if valid, or (False, error_response) if invalid.
    """
    if not email:
        return False, JsonResponse({
            'success': False,
            'error': 'Email is required'
        }, status=400)
    
    if not password:
        return False, JsonResponse({
            'success': False,
            'error': 'Password is required'
        }, status=400)
    
    if check_password_length and len(password) < 8:
        return False, JsonResponse({
            'success': False,
            'error': 'Password must be at least 8 characters long'
        }, status=400)
    
    return True, None


def error_response(message, status=500):
    """Return a standardized error response."""
    return JsonResponse({
        'success': False,
        'error': message
    }, status=status)


def user_response_data(user):
    """Return standardized user data dictionary."""
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email
    }


def generate_unique_username(email):
    """Generate a unique username from email."""
    base_username = email.split('@')[0]
    username = base_username
    counter = 1
    
    while User.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1
    
    return username
