from django.utils.translation import gettext_lazy as _
from django.core.validators import RegexValidator
from django.utils.deconstruct import deconstructible
from rest_framework import serializers

@deconstructible
class LanguageValidator:
    """Validate that language choice is valid"""
    
    valid_languages = ['uz', 'tr']
    
    def __call__(self, value):
        if value not in self.valid_languages:
            raise serializers.ValidationError(
                _("Language must be one of: {}").format(', '.join(self.valid_languages))
            )
    
    def __eq__(self, other):
        return isinstance(other, LanguageValidator)

@deconstructible
class RoleValidator:
    """Validate user role"""
    
    valid_roles = ['admin', 'teacher', 'student']
    
    def __call__(self, value):
        if value not in self.valid_roles:
            raise serializers.ValidationError(
                _("Role must be one of: {}").format(', '.join(self.valid_roles))
            )
    
    def __eq__(self, other):
        return isinstance(other, RoleValidator)

@deconstructible
class PaymentStatusValidator:
    """Validate payment status"""
    
    valid_statuses = ['pending', 'confirmed', 'failed', 'cancelled']
    
    def __call__(self, value):
        if value not in self.valid_statuses:
            raise serializers.ValidationError(
                _("Payment status must be one of: {}").format(', '.join(self.valid_statuses))
            )
    
    def __eq__(self, other):
        return isinstance(other, PaymentStatusValidator)

@deconstructible
class CoinAmountValidator:
    """Validate coin amounts are positive integers"""
    
    def __call__(self, value):
        if value < 0:
            raise serializers.ValidationError(
                _("Coin amount cannot be negative")
            )
        if not isinstance(value, int):
            raise serializers.ValidationError(
                _("Coin amount must be an integer")
            )
    
    def __eq__(self, other):
        return isinstance(other, CoinAmountValidator)

@deconstructible
class PhoneNumberValidator:
    """Validate Uzbekistan phone numbers"""
    
    def __call__(self, value):
        import re
        # Uzbek phone pattern: +998XXXXXXXXX or 998XXXXXXXXX
        pattern = r'^(\+998|998)[0-9]{9}$'
        if not re.match(pattern, value.replace(' ', '')):
            raise serializers.ValidationError(
                _("Invalid Uzbek phone number format. Use +998XXXXXXXXX")
            )
    
    def __eq__(self, other):
        return isinstance(other, PhoneNumberValidator)

@deconstructible
class SimilarityThresholdValidator:
    """Validate similarity threshold is between 0 and 1"""
    
    def __call__(self, value):
        if not (0 <= value <= 1):
            raise serializers.ValidationError(
                _("Similarity threshold must be between 0 and 1")
            )
    
    def __eq__(self, other):
        return isinstance(other, SimilarityThresholdValidator)
