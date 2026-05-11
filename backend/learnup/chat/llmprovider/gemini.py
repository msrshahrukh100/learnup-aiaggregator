from google import genai
from google.genai import types
from .base import BaseLLMProvider
from django.conf import settings
from typing import List, Dict, Any, Optional

class GeminiProvider(BaseLLMProvider):
    """
    Google Gemini API implementation of the LLM provider using the new google-genai SDK.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or getattr(settings, "GEMINI_API_KEY", None)
        self.client = None
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)

    def _format_history(self, messages: List[Dict[str, str]]) -> List[types.Content]:
        """
        Convert standard message format to Gemini format.
        Standard: {'role': 'user'|'assistant', 'content': '...'}
        Gemini: types.Content(role='user'|'model', parts=[types.Part(text='...')])
        """
        history = []
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            history.append(types.Content(role=role, parts=[types.Part(text=msg["content"])]))
        return history

    def generate_response(
        self, 
        messages: List[Dict[str, str]], 
        model_name: str = "gemini-2.0-flash", 
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate a response using Gemini API (Synchronous).
        """
        if not self.client:
            raise ValueError("Gemini API key is not configured.")
            
        if not messages:
            return {"response": "", "usage": {}}
        
        # Include up to the last 5 messages in the history
        history_window = messages[-6:-1]
        history = self._format_history(history_window)
        prompt = messages[-1]["content"]
        
        chat = self.client.chats.create(model=model_name, history=history)
        response = chat.send_message(prompt, config=kwargs.get("config"))
        
        usage = {
            "prompt_tokens": response.usage_metadata.prompt_token_count,
            "candidates_tokens": response.usage_metadata.candidates_token_count,
            "total_tokens": response.usage_metadata.total_token_count,
        }
        
        return {
            "response": response.text,
            "usage": usage
        }
