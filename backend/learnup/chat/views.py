import json
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from .models import Chat, ChatMessage
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
        assistant_response = provider.generate_response(messages, model_name=model_name)

        # 5. Save assistant response to database
        ChatMessage.objects.create(chat=chat, role='assistant', content=assistant_response)

        return JsonResponse({
            'response': assistant_response,
            'role': 'assistant',
            'chat_id': chat_id,
            'chat_title': chat.title
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
