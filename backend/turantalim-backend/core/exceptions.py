from rest_framework.exceptions import APIException
from rest_framework import status

class ValidationError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Validation error occurred"
    default_code = 'validation_error'

class PaymentError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Payment processing error"
    default_code = 'payment_error'

class PaymeError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Payme API error"
    default_code = 'payme_error'

class AudioProcessingError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Audio processing error"
    default_code = 'audio_processing_error'

class SimilarityCheckError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Similarity check failed"
    default_code = 'similarity_check_error'

class NotificationError(APIException):
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = "Notification delivery failed"
    default_code = 'notification_error'

class GroupScheduleError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Group scheduling error"
    default_code = 'group_schedule_error'

class UnauthorizedAccess(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "You do not have permission to access this resource"
    default_code = 'unauthorized_access'
