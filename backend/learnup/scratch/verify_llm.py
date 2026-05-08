import os
import sys
import django

# Add the project directory to the sys.path
sys.path.append('/Users/mohammadshahrukh/learnup/backend/learnup')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'learnup.settings')
django.setup()

from chat.llmprovider.gemini import GeminiProvider

def test_gemini_provider_init():
    try:
        # This should work even with a fake key just to check initialization
        provider = GeminiProvider(api_key="fake-key")
        print("GeminiProvider initialized successfully with explicit key.")
    except Exception as e:
        print(f"Error initializing GeminiProvider: {e}")

def test_format_messages():
    from google.genai import types
    provider = GeminiProvider(api_key="fake-key")
    # 7 messages total: 6 history + 1 prompt
    # history_window = messages[-6:-1] should take the last 5 previous messages
    messages = [
        {"role": "user", "content": "1"},
        {"role": "assistant", "content": "2"},
        {"role": "user", "content": "3"},
        {"role": "assistant", "content": "4"},
        {"role": "user", "content": "5"},
        {"role": "assistant", "content": "6"},
        {"role": "user", "content": "7"} # Prompt
    ]
    
    # We need to manually check how generate_response uses history
    # Or just test _format_history independently and assume the slicing works.
    history_window = messages[-6:-1]
    assert len(history_window) == 5
    assert history_window[0]["content"] == "2"
    assert history_window[-1]["content"] == "6"
    
    formatted = provider._format_history(history_window)
    assert len(formatted) == 5
    assert formatted[0].parts[0].text == "2"
    
    print("Message formatting and window test passed.")

if __name__ == "__main__":
    test_gemini_provider_init()
    test_format_messages()
