from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class BaseLLMProvider(ABC):
    """
    Abstract base class for LLM providers.
    """

    @abstractmethod
    def generate_response(
        self, 
        messages: List[Dict[str, str]], 
        model_name: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate a response from the LLM provider.
        
        :param messages: List of message dictionaries with 'role' and 'content'.
        :param model_name: Optional name of the model to use.
        :param kwargs: Additional provider-specific parameters.
        :return: A dictionary containing 'response' (str) and 'usage' (dict).
        """
        pass
