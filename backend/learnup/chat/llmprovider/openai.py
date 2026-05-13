from openai import OpenAI
from .base import BaseLLMProvider
from django.conf import settings
from typing import List, Dict, Any, Optional

class OpenAIProvider(BaseLLMProvider):
    """
    OpenAI implementation of the LLM provider.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or getattr(settings, "OPENAI_API_KEY", None)
        self.client = None
        if self.api_key:
            self.client = OpenAI(api_key=self.api_key)

    def generate_response(
        self, 
        messages: List[Dict[str, str]], 
        model_name: str = "gpt-4o-mini", 
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate a response using OpenAI API.
        """
        if not self.client:
            raise ValueError("OpenAI API key is not configured.")
            
        if not messages:
            return {"response": "", "usage": {}}
        
        # Include up to the last 6 messages (history + current)
        history_window = messages[-6:]
        
        response = self.client.chat.completions.create(
            model=model_name,
            messages=history_window,
            **kwargs
        )
        
        usage = {
            "prompt_tokens": response.usage.prompt_tokens,
            "completion_tokens": response.usage.completion_tokens,
            "total_tokens": response.usage.total_tokens,
        }
        
        return {
            "response": response.choices[0].message.content,
            "usage": usage
        }
