import os
import json 
import pymeshlab
from utils import BASE_DIR

with open(f"{BASE_DIR}/data/demo.json", "r") as demo_json:
    DEMO_JSON = json.loads(demo_json.read())
   
async def load_img_bytes(img_path):
    _, ext = os.path.splitext(img_path)
    with open(img_path, "rb") as img_bytes:
        return img_bytes.read(), ext

async def load_mesh(mesh_path):
    mesh_set = pymeshlab.MeshSet()
    mesh_set.load_new_mesh(mesh_path)

    faces = mesh_set.current_mesh().face_matrix().tolist()
    vertices = mesh_set.current_mesh().vertex_matrix().tolist()
    colors = mesh_set.current_mesh().vertex_color_matrix().tolist()
    normals = mesh_set.current_mesh().vertex_normal_matrix().tolist()

    return {
        "faces": faces,
        "colors": colors,
        "normals": normals,
        "vertices": vertices,
    }
    

