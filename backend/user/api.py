"""
User api
"""
from api import api
from utils import get
from user import consumers
from project.models import Project
from user.models import CustomUser
from django.urls import path, re_path

@api.get("/user")
def get_user(request, id: str):
    user_json = get(CustomUser, id)
    if "error" in user_json: return user_json

    return {
        **user_json,
        "projects": [project.json() for project in Project.objects.filter(owner__id=id)],
    }

websocket_urlpatterns = [
    re_path(r'ws/user/(?P<uid>\w+)$', consumers.UserConsumer.as_asgi(), name="user_consumer")
]