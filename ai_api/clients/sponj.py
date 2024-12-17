import base64
from PIL import Image
from typing import List

from utils import BASE_DIR
from utils.mesh import SponjMesh
from utils.img import img_to_bytes
from utils.client import BaseClient

class SponjClient(BaseClient):
    def __init__(self):
        self.log_path = f"{BASE_DIR}/logs/sponj.log"
        self.base_url = "http://45.33.17.11:8001/api"
        self.endpoint = {
            "notify": {
                "node": f"{self.base_url}/data/notify/node",
                "mesh": f"{self.base_url}/data/notify/mesh"
            }
        }
    
    def format_params(self, **kwargs):
        return {
            key: value 
            for key, value in kwargs.items()
        }
    
    def send_img(self, uid: str, path_id: str, img: Image):
        params = self.format_params(uid=uid, path_id=path_id)
        body = {
            "mesh": None,
            "labels": None,
            "img": base64.b64encode(img_to_bytes(img)).decode('utf-8')
        }

        self.post(self.endpoint['notify']['node'], params=params, param_key="params", json=body)
        
    def send_mesh(self, uid: str, path_id: str, task_id: str, mesh: SponjMesh):
        params = self.format_params(uid=uid, path_id=path_id, task_id=task_id)
        body = {
            "img": None,
            "labels": None,
            "mesh": mesh.json()
        }

        self.post(self.endpoint['notify']['node'], params=params, param_key="params", json=body)

    def send_labels(self, uid: str, path_id: str, labels: List[int]):
        params = self.format_params(uid=uid, path_id=path_id)
        body = {
            "img": None,
            "mesh": None,
            "labels": labels
        }

        self.post(self.endpoint['notify']['mesh'], params=params, param_key="params", json=body)