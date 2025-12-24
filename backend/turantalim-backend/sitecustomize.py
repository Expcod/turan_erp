"""
Python 3.14 compatibility patch for Django template context.
This file is automatically loaded by Python before any other imports.
Place this file in the site-packages directory or project root.
"""
import sys

if sys.version_info >= (3, 14):
    import copy
    
    _original_copy = copy.copy
    
    def _patched_copy(x):
        """Patched copy function for Python 3.14 compatibility with Django"""
        cls = x.__class__
        module = getattr(cls, '__module__', '')
        
        # Check if this is a Django context class
        if module == 'django.template.context':
            # Create new instance without calling __init__
            result = object.__new__(cls)
            
            # Copy all instance attributes
            for attr in ['dicts', 'template', 'render_context', '_current_app', 
                         'use_l10n', 'use_tz', 'autoescape', 'engine', '_processors',
                         '_processors_index', 'request']:
                if hasattr(x, attr):
                    try:
                        setattr(result, attr, getattr(x, attr))
                    except AttributeError:
                        pass
            
            # Special handling for dicts - make a shallow copy of the list
            if hasattr(x, 'dicts'):
                result.dicts = list(x.dicts)
                
            return result
        
        # For all other objects, use original copy
        return _original_copy(x)
    
    copy.copy = _patched_copy
    print("Python 3.14 Django compatibility patch applied.")
