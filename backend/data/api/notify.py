import asyncio
from channels.layers import get_channel_layer

def notify(uid, data_json, notify_type="nodeUpdate", **kwargs):
    print(f"[notify] >> notifying {notify_type} ({id})...")

    channel_layer = get_channel_layer()
    asyncio.run(channel_layer.group_send(
        uid, 
        {
            "json": {
                'data': data_json,
                'type': notify_type,
                **kwargs
            },
            "type": "notify", 
        }
    ))