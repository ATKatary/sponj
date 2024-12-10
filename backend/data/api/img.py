import asyncio
import requests
from data.models import Node
from data.events import PENDING_EVENT
from data.api.queues import path_meta
from channels.layers import get_channel_layer
from data.api.utils import parse_data, AI_API_URL
from data.api.demo import DEMO_JSON, load_img_bytes

def gen_img(uid, path_id, nid, geo, style=None, is_demo=False):
    channel_layer = get_channel_layer()
    asyncio.run(channel_layer.group_send(uid, PENDING_EVENT(nid)))

    url, body = f"{AI_API_URL}/generate/img", {
        'uid': uid,
        'path_id': path_id,
        'geo': parse_data(geo),
        'style': parse_data(style),
    }

    node = Node.objects.get(id=nid)
    node.status = "pending"
    node.save()
    
    if is_demo:
        ext = "png"
        title = node.data.title
        img_bytes, ext = load_img_bytes(DEMO_JSON["generatedImg"][title])
        node.add_img(img_bytes, ext)

        data = node.data.json()
        channel_layer.group_send(
            uid, 
            {
                "json": {
                    'nid': nid,
                    'data': data,
                    'status': "ready",
                    'type': "nodeUpdate",
                },
                "type": "notify", 
            }
        )

        path_meta[path_id][0][nid] = {**data, 'type': "generatedImg"} 
    else:
        requests.post(url, json=body)
    