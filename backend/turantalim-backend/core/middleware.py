from django.utils.translation import activate, get_language
from django.utils.deprecation import MiddlewareNotUsed

class LanguageMiddleware:
    """Middleware to handle language selection from headers or query params"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Get language from request
        language = self._get_language(request)
        activate(language)
        response = self.get_response(request)
        return response
    
    def _get_language(self, request):
        """Determine language from Accept-Language header or query param"""
        # Check query parameter first
        lang = request.GET.get('lang', None)
        if lang and lang in ['uz', 'tr']:
            return lang
        
        # Check header
        accept_language = request.META.get('HTTP_ACCEPT_LANGUAGE', '')
        if accept_language:
            # Parse Accept-Language header
            languages = [lang.split('-')[0] for lang in accept_language.split(',')]
            for lang in languages:
                if lang in ['uz', 'tr']:
                    return lang
        
        # Default to Uzbek
        return 'uz'

class ErrorHandlingMiddleware:
    """Middleware for handling errors consistently"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        return response
