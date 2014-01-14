import json
from functools import wraps

from django.http import HttpResponseForbidden
from django.utils.decorators import available_attrs


def api_user_passes_test(test_func):
    """
    Decorator for views that checks that the user passes the given test,
    returning 401 if they don't.
    """

    def decorator(view_func):
        @wraps(view_func, assigned=available_attrs(view_func))
        def _wrapped_view(request, *args, **kwargs):
            if test_func(request.user):
                return view_func(request, *args, **kwargs)
            return HttpResponseForbidden(json.dumps({
                'success': False,
                'message': 'User is not allowed to access this endpoint.'}))
        return _wrapped_view
    return decorator
