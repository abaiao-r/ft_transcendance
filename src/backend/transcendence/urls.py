
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt import views as jwt_views
#from two_factor.urls import urlpatterns as tf_urls
from api.views.LoginAPIView import *
from api.views.SignupAPIView import *
from api.views.SettingsAPIView import *
from api.views.OAuthLoginAPIView import *
from api.views.OAuthCallbackAPIView import *
from api.views.LogoutAPIView import *
from api.views.ActivateTwoFactorAPIView import *
from api.views.VerifyTwoFactorAPIView import *
from chat.views.AddFriendView import *
from chat.views.ApiOnlineFriends import *
from chat.views.ApiOnlineUsers import *
from chat.views.ApiChatMessages import *
from chat.views.ApiUnread import *
from chat.views.ListFriendsView import *


urlpatterns = [
    path('admin/', admin.site.urls),
    #path('', chat_views.index, name='index'),
    #path('<int:id>', chat_views.index, name='index'),
    path('login/', LoginAPIView.as_view(), name='login_view'),
    path('signup/', SignupAPIView.as_view(), name='signup_view'),
    path('settings/', SettingsAPIView.as_view(), name='settings_view'),
    path('oauth/login/', OAuthLoginAPIView.as_view(), name='oauth_login'),
    path('oauth/callback/', OAuthCallbackAPIView.as_view(), name='oauth_callback'),
    path('logout/', LogoutAPIView.as_view(), name='logout_view'),
	path('2fa/activation/', ActivateTwoFactorAPIView.as_view(), name='2fa_activation'),
	path('2fa/verify/', VerifyTwoFactorAPIView.as_view(), name='2fa_verification'),

    path('online-friends/', ApiOnlineFriends.as_view(), name='online-friends'),
    path('online-friends/<int:id>', ApiOnlineFriends.as_view(), name='online-friends'),
    path('online-users/', ApiOnlineUsers.as_view(), name='online-users'),
    path('online-users/<int:id>', ApiOnlineUsers.as_view(), name='online-users'),
    path('chat-messages/<int:id>', ApiChatMessages.as_view(), name='chat_messages'),
    path('unread/', ApiUnread.as_view(), name='api_unread'),
    path('add_friend/', AddFriendView.as_view(), name='add_friend'),
    
    path('api/token/', jwt_views.TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    path('list_friends/', ListFriendsView.as_view(), name='list_friends'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


