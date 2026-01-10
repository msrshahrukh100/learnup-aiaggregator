from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login as auth_login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json


@csrf_exempt
@require_http_methods(["POST"])
def signup(request):
    """
    Handle user signup with email and password.
    
    Expected JSON payload:
    {
        "email": "user@example.com",
        "password": "securepassword"
    }
    
    Returns:
    - 201: User created successfully
    - 400: Invalid input or validation errors
    - 409: User already exists
    """
    try:
        # Parse JSON request body
        data = json.loads(request.body)
        
        # Extract fields
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        # Validation
        if not email:
            return JsonResponse({
                'success': False,
                'error': 'Email is required'
            }, status=400)
        
        if not password:
            return JsonResponse({
                'success': False,
                'error': 'Password is required'
            }, status=400)
        
        if len(password) < 8:
            return JsonResponse({
                'success': False,
                'error': 'Password must be at least 8 characters long'
            }, status=400)
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            return JsonResponse({
                'success': False,
                'error': 'A user with this email already exists'
            }, status=409)
        
        # Generate unique username from email
        base_username = email.split('@')[0]
        username = base_username
        counter = 1
        
        # Handle username conflicts by appending numbers
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        
        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        
        # Optionally auto-login the user after signup
        auth_login(request, user)
        
        return JsonResponse({
            'success': True,
            'message': 'User created successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON format'
        }, status=400)
    
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'An error occurred: {str(e)}'
        }, status=500)


def login(request):
    pass