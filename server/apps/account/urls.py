from django.conf.urls import *
from views import *


urlpatterns = patterns('',
	(r'^authenticateUser', authenticateUser),
	(r'^createUser', createUser),
	(r'^updateUser', updateUser),
	(r'^updatePassword', updatePassword),
	(r'^sendFeedback', sendFeedback),
	(r'^forgotPassword', forgotPassword),
    (r'^password_reset/$', 'django.contrib.auth.views.password_reset', {'post_reset_redirect' : '/accounts/login?next=/fisher'}),
    (r'^password_reset_done/$', 'django.contrib.auth.views.password_reset_complete'),
    (r'^password_reset_confirm/(?P<uidb36>[0-9A-Za-z]+)-(?P<token>.+)/$', 'django.contrib.auth.views.password_reset_confirm'),
)