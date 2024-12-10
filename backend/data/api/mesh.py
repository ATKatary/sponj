"""
Data api
"""
import asyncio
import requests
from data.models import Node
from data.events import PENDING_EVENT
from data.api.queues import path_meta
from channels.layers import get_channel_layer
from data.api.demo import DEMO_JSON, load_mesh
from data.api.utils import parse_data, AI_API_URL

def gen_mesh(uid, path_id, nid, geo=None, style=None, is_demo=False):
    channel_layer = get_channel_layer()
    asyncio.run(channel_layer.group_send(uid, PENDING_EVENT(nid)))

    print(f"[gen_mesh] >> generating mesh...")
    url, body = f"{AI_API_URL}/generate/mesh", {
        'uid': uid,
        'path_id': path_id,
        'geo': parse_data(geo),
        'style': parse_data(style),
    }

    print(f"[gen_mesh] (body.geo) >> {body['geo'].keys()}")

    node = Node.objects.get(id=nid)
    node.status = "pending"
    node.save()
    
    if is_demo:
        title = node.data.title()
        response = load_mesh(DEMO_JSON["mesh"][title])
        node.add_mesh(uid, response)

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

        path_meta[path_id][0][nid] = {**data, 'type': "mesh"} 
    else:
        requests.post(url, json=body)

