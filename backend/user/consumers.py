import json
from utils import report
from user.models import CustomUser
from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncJsonWebsocketConsumer


class UserConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        await self.accept()
        params =  self.scope['url_route']['kwargs']
        uid = params['uid'].replace("_", "-")

        self.user = await CustomUser.objects.aget(id=uid)
        await self.channel_layer.group_add(self.user.id, self.channel_name)

        report(f"[user][consumers] >> {self.user.id} connected")

    async def disconnect(self, close_code):
        pass

    async def notify(self, event):
        report(f"[user][consumers] >> notifying {self.user.id}...")
        await self.send(text_data=json.dumps(event['json']))
    
    async def notify_bytes(self, event):
        report(f"[user][consumers] >> notifying {self.user.id}...")
        await self.send(bytes_data=event['bytes'])
    
    async def receive(self, text_data=None, bytes_data=None):
        report(f"[user][consumers] >> received {text_data} from {self.user.id}...")