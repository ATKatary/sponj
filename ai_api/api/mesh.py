import shutil
import zipfile

from utils.mesh import SponjMesh
from utils import download, rename
from utils.img import base64_to_img
from api.schema import Geometry, Style
from api.vars import (
    sd_client, 
    path_to_uid,
    sponj_client,
    openai_client, 
    tripo3d_client, 
    glb_task_to_path, 
    obj_task_to_path, 
)

def generate_mesh(path_id: str, geo: Geometry, style: Style) -> str | None:
    if geo.prompt:
        prompt = geo.prompt 
        mesh_id = tripo3d_client.text_to_mesh(prompt=prompt)

        glb_task_to_path[mesh_id] = path_id
        return mesh_id

    else:
        if geo.img:
            img = base64_to_img(geo.img)
        
        if geo.sketch:
            img = base64_to_img(geo.sketch)
            img = sd_client.sketch_to_img(img)

        if geo.generatedImg:
            img_no_bg = base64_to_img(geo.generatedImg)

        else:
            caption = openai_client.caption(img)
            structured_img = sd_client.structure(img, f"{caption}. high resolution, 8k, photorealistic")
            img_no_bg = sd_client.remove_bg(structured_img)

        mesh_id = tripo3d_client.generate_mesh(img_no_bg)

        glb_task_to_path[mesh_id] = path_id
        return mesh_id

def on_mesh_generated(task_id: str, mesh_url: str, ext: {'glb', 'obj'}, type: {'text_to_model', 'image_to_model', 'convert_model'}):
    if ext == "glb":
        if task_id not in glb_task_to_path:
            print(f"glb task {task_id} not in {glb_task_to_path}")
            return 

        path_id = glb_task_to_path[task_id]
        _, glb_path = download(mesh_url, path_id, ext)

        obj_task_id = tripo3d_client.convert_mesh(task_id)
        
        del glb_task_to_path[task_id]
        glb_task_to_path[obj_task_id] = glb_path
        obj_task_to_path[obj_task_id] = path_id
        

    if ext == "obj":
        if task_id not in obj_task_to_path:
            print(f"obj task {task_id} not in {obj_task_to_path}")
            return 
        
        path_id = obj_task_to_path[task_id]
        obj_dir, zip_path = download(mesh_url, path_id, "zip")

        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(obj_dir)

        obj_path = rename(obj_dir, "obj", path_id)[0]
        obj_task_to_path[task_id] = obj_path
        
        
        glb_path = glb_task_to_path[task_id]
        mesh = SponjMesh(obj_path, glb_path=glb_path)

        mesh.get_largest_cc() 
        # mesh.decimate(targetfacenum=15000)

        gif_path = obj_path.replace(".obj", ".gif")
        mesh.generate_gif(gif_path, frames=12, save_kwargs={"facecolor": "#887e7e"})
        
        uid = path_to_uid[path_id]
        sponj_client.send_mesh(uid, path_id, task_id, mesh)
        
        # cleanup
        shutil.rmtree(obj_dir) 
        del glb_task_to_path[task_id]
        del obj_task_to_path[task_id]
