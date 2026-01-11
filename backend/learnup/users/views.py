from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login as auth_login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .utils import (
    parse_json_request,
    validate_credentials,
    error_response,
    user_response_data,
    generate_unique_username
)


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
        # Parse request
        data, error = parse_json_request(request)
        if error:
            return error
        
        # Extract and validate credentials
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        is_valid, error = validate_credentials(email, password, check_password_length=True)
        if not is_valid:
            return error
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            return error_response('A user with this email already exists', status=409)
        
        # Create user
        username = generate_unique_username(email)
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        
        # Auto-login after signup
        auth_login(request, user)
        
        return JsonResponse({
            'success': True,
            'message': 'User created successfully',
            'user': user_response_data(user)
        }, status=201)
        
    except Exception as e:
        return error_response(f'An error occurred: {str(e)}')


@csrf_exempt
@require_http_methods(["POST"])
def login(request):
    """
    Handle user login with email and password.
    
    Expected JSON payload:
    {
        "email": "user@example.com",
        "password": "securepassword"
    }
    
    Returns:
    - 200: Login successful
    - 400: Invalid input or validation errors
    - 401: Invalid credentials
    """
    try:
        # Parse request
        data, error = parse_json_request(request)
        if error:
            return error
        
        # Extract and validate credentials
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        is_valid, error = validate_credentials(email, password)
        if not is_valid:
            return error
        
        # Find user by email
        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            return error_response('Invalid email or password', status=401)
        
        # Authenticate user
        user = authenticate(request, username=user_obj.username, password=password)
        
        if user is None:
            return error_response('Invalid email or password', status=401)
        
        # Login the user (creates session)
        auth_login(request, user)
        
        return JsonResponse({
            'success': True,
            'message': 'Login successful',
            'user': user_response_data(user)
        }, status=200)
        
    except Exception as e:
        return error_response(f'An error occurred: {str(e)}')