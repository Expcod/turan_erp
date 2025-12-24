#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

# Python 3.14 compatibility patch - must run BEFORE any Django import
if sys.version_info >= (3, 14):
    import copy as copy_module
    
    _original_copy = copy_module.copy
    
    def _patched_copy(obj):
        """
        Patched copy.copy() for Python 3.14 compatibility with Django.
        The issue is that Python 3.14 changed how copy() works with __copy__ methods
        that call super().__copy__().
        """
        cls = obj.__class__
        cls_module = getattr(cls, '__module__', '')
        
        # Handle Django template context classes
        if cls_module == 'django.template.context':
            result = object.__new__(cls)
            
            # Copy dicts (required for all context classes)
            if hasattr(obj, 'dicts'):
                result.dicts = list(obj.dicts)
            
            # Copy common attributes
            for attr in ('autoescape', 'use_l10n', 'use_tz', 'template', 
                        'request', 'render_context', '_processors', 
                        '_processors_index', '_current_app', 'engine'):
                if hasattr(obj, attr):
                    setattr(result, attr, getattr(obj, attr))
            
            return result
        
        # Use original copy for everything else
        return _original_copy(obj)
    
    # Replace copy.copy globally
    copy_module.copy = _patched_copy


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
