import json
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_GET
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.db import transaction
from .models import Chat, ChatMessage, UserTokenBalance, UserTokenTransaction
from .llmprovider.factory import LLMFactory

@csrf_exempt
@require_POST
def chat_view(request):
    """
    Main endpoint for chat interactions.
    Requires authentication.
    Expects JSON: { "message": "...", "model_name": "...", "chat_id": "..." (optional) }
    """
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    try:
        data = json.loads(request.body)
        user_message = data.get('message')
        model_name = data.get('model_name')
        chat_id = data.get('chat_id')

        if not user_message or not model_name:
            return JsonResponse({'error': 'Missing required fields: message, model_name'}, status=400)

        # Check Token Balance
        try:
            token_balance = UserTokenBalance.objects.get(user=request.user)
        except UserTokenBalance.DoesNotExist:
            token_balance = UserTokenBalance.objects.create(user=request.user, balance=1000)
            
        if token_balance.balance <= 0:
            return JsonResponse({'error': 'Insufficient tokens. Please top up your balance.'}, status=402)

        # Retrieve or create the chat session
        if chat_id:
            try:
                # Ensure the chat exists and belongs to the authenticated user
                chat = Chat.objects.get(id=chat_id, user=request.user)
            except Chat.DoesNotExist:
                return JsonResponse({'error': f'Chat with id {chat_id} not found or access denied'}, status=404)
        else:
            # Create a new chat session for the authenticated user
            title = user_message[:50] + "..." if len(user_message) > 50 else user_message
            chat = Chat.objects.create(user=request.user, title=title)
            chat_id = chat.id
        
        # 1. Save user message to database
        ChatMessage.objects.create(chat=chat, role='user', content=user_message)

        # 2. Get history for context
        messages = list(chat.messages.all().values('role', 'content'))
        
        # 3. Get provider instance from factory
        try:
            provider = LLMFactory.get_provider(model_name)
        except ValueError as e:
            return JsonResponse({'error': str(e)}, status=400)

        # 4. Generate response from LLM
        llm_result = provider.generate_response(messages, model_name=model_name)
        assistant_response = llm_result['response']
        usage = llm_result['usage']
        total_tokens = usage.get('total_tokens', 0)

        with transaction.atomic():
            # 5. Save assistant response to database
            ChatMessage.objects.create(chat=chat, role='assistant', content=assistant_response)
            
            # 6. Deduct tokens
            token_balance.balance -= total_tokens
            token_balance.save()
            
            # 7. Record transaction
            UserTokenTransaction.objects.create(
                user=request.user,
                amount=total_tokens,
                transaction_type='usage',
                description=f"Usage for chat: {chat.title} (Model: {model_name})"
            )

        return JsonResponse({
            'response': assistant_response,
            'role': 'assistant',
            'chat_id': chat_id,
            'chat_title': chat.title,
            'tokens_used': total_tokens,
            'remaining_balance': float(token_balance.balance)
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_GET
def get_models_view(request):
    """
    Returns a list of available models.
    """
    try:
        models = LLMFactory.get_available_models()
        return JsonResponse({'models': models})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@require_GET
def get_chats_view(request):
    """
    Returns chats for the authenticated user with pagination.
    """
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    try:
        limit = int(request.GET.get('limit', 10))
        offset = int(request.GET.get('offset', 0))
    except ValueError:
        limit = 10
        offset = 0
    
    queryset = Chat.objects.filter(user=request.user)
    total_count = queryset.count()
    chats = queryset.values('id', 'title', 'updated_at')[offset:offset+limit]
    
    return JsonResponse({
        'chats': list(chats),
        'total_count': total_count,
        'has_more': offset + limit < total_count
    })


@require_GET
def get_chat_messages_view(request, chat_id):
    """
    Returns all messages for a specific chat.
    """
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    try:
        chat = Chat.objects.get(id=chat_id, user=request.user)
        messages = chat.messages.all().values('role', 'content', 'created_at')
        return JsonResponse({'messages': list(messages)})
    except Chat.DoesNotExist:
        return JsonResponse({'error': 'Chat not found'}, status=404)

