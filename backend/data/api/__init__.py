"""
Data api
"""
import uuid
import requests
from io import BytesIO
from typing import List, Tuple

from ninja import File
from ninja.files import UploadedFile

from api import api
from utils import get, APP_URL
from utils import base64_to_bytes
from data.models import Data, Node
from playground.models import Mesh
from data.api.notify import notify
from data.api.utils import AI_API_URL
from data.api.path import execute_path
from data.api.queues import path_meta, path_queue, pending_nodes, pending_meshes
from data.schema import NodeSchema, EdgeSchema, NotifyNodeSchema, NotifyMeshSchema

@api.get("/data")
def get_data(request, id: str):
    return get(Data, id)

@api.get("/data/status")
def get_status(request, id: str):
    node = Node.objects.get(id=id)

    return {"status": node.status}

@api.post("/data/upload/img")
def upload_img(request, id: str, img: UploadedFile = File(...)):
    node = Node.objects.get(id=id)
    node.add_img(BytesIO(img.read()), img.name.split(".")[-1])

    return f"{APP_URL}{node.data.img.url}"

@api.post("/mb/runPath")
def run_path(
    request,
    uid: str, 
    mid: str, 
    is_demo: bool, 
    path: List[Tuple[NodeSchema, List[EdgeSchema]]]
) -> List[str]:
    node_map = {}
    for i in range(len(path) - 1, -1, -1):
        node, edges = path[i]
        node_map[node.id] = {**get(Data, node.data.id, {}), "type": node.type}
    
    path_id = str(uuid.uuid4())
    path_queue[path_id] = path
    path_meta[path_id] = (node_map, is_demo)
    
    execute_path(uid, path_id)

@api.post("/data/notify/node")
def notify_node(
    request, 
    uid: str, 
    path_id: str, 
    body: NotifyNodeSchema,
    task_id: str = None,
):
    nid = pending_nodes[path_id]
    node = Node.objects.get(id=nid)
    node.status = "ready"
    node.save()

    if body.img:
        ext = "png"
        node_type = "generatedImg"
        img_bytes = base64_to_bytes(body.img)

        node.add_img(img_bytes, ext)

    elif body.mesh:
        node_type = "mesh"
        node.add_mesh(uid, body.mesh, task_id)

    else:
        raise ValueError("Unknown data type")

    data_json = node.data.json()
    notify(uid, data_json, nid=nid, status="ready")

    del pending_nodes[path_id]
    if path_id in path_queue:
        path_meta[path_id][0][nid] = {**data_json, 'type': node_type} 
        execute_path(uid, path_id)

@api.post("/data/notify/mesh")
def notify_mesh(
    request, 
    uid: str, 
    path_id: str, 
    body: NotifyMeshSchema
):
    mid = pending_meshes[path_id] # mesh id
    mesh = Mesh.objects.get(id=mid)
    
    if body.labels: 
        mesh.segment(body.labels)

    mesh_json = mesh.json(meta=True)
    notify(uid, mesh_json, mid=mid, notify_type="meshUpdate")

    del pending_meshes[path_id]

@api.post("/data/mesh/segment")
def segment_mesh(request, uid: str, mid: str):
    path_id = str(uuid.uuid4())
    mesh = Mesh.objects.get(id=mid)

    mesh_json = mesh.json()
    pending_meshes[path_id] = mid 

    url, body = f"{AI_API_URL}/segment/mesh", {
        'uid': uid,
        'path_id': path_id,
        'faces': mesh_json["faces"],
        'vertices': mesh_json["vertices"],
    }

    requests.post(url, json=body)


