from typing import Dict, Type
from .base import BaseLLMProvider
from .gemini import GeminiProvider

class LLMFactory:
    """
    Factory class to get the appropriate LLM provider based on the model name.
    """
    _provider_map: Dict[str, Type[BaseLLMProvider]] = {
        "gemini": GeminiProvider,
        # "openai": OpenAIProvider,  # Add other providers here later
    }

    @classmethod
    def get_provider(cls, model_name: str) -> BaseLLMProvider:
        """
        Returns an instance of the provider based on the model name prefix.
        """
        model_name = model_name.lower()
        
        if model_name.startswith("gemini"):
            return cls._provider_map["gemini"]()
        # Example for OpenAI later:
        # elif model_name.startswith("gpt"):
        #     return cls._provider_map["openai"]()
            
        raise ValueError(f"No LLM provider found for model: {model_name}")
    @classmethod
    def get_available_models(cls):
        """
        Returns a list of supported model names.
        """
        return [
            "gemini-2.0-flash",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-3.1-flash-lite"
        ]
