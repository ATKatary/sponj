import json
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.img import generate_img
from utils.thread import run_in_bg
from api.segment import segment_mesh
from api.vars import tripo3d_client, path_to_uid
from api.mesh import generate_mesh, on_mesh_generated
from api.schema import MeshRequest, ImgRequest, SegmentRequest

BASE_DIR = Path(__file__).resolve().parent
with open(f"{BASE_DIR}/config.json", "r") as config:
    CONFIG = json.loads(config.read())

run_in_bg(tripo3d_client.watch, on_success=on_mesh_generated, is_async=True)

api = FastAPI()

api.add_middleware(
    CORSMiddleware,
    **CONFIG
)

@api.post("/ai/generate/mesh")
def generate_mesh_api(mesh_info: MeshRequest):
    uid = mesh_info.uid
    path_id = mesh_info.path_id

    geo = mesh_info.geo
    style = mesh_info.style

    path_to_uid[path_id] = uid
    generate_mesh(path_id, geo, style)

@api.post("/ai/generate/img")
def generate_img_api(img_info: ImgRequest):
    uid = img_info.uid
    path_id = img_info.path_id

    geo = img_info.geo
    style = img_info.style
    
    path_to_uid[path_id] = uid
    generate_img(path_id, geo, style)


@api.post("/ai/segment/mesh")
def segment(mesh: SegmentRequest):
    uid = mesh.uid
    path_id = mesh.path_id

    faces = mesh.faces
    vertices = mesh.vertices

    path_to_uid[path_id] = uid
    
    run_in_bg(segment_mesh, path_id, vertices, faces)


    