from clients.sd import SDCliet
from clients.sponj import SponjClient
from clients.openai import OpenAIClient
from clients.tripo3d import Tripo3dClient

sd_client = SDCliet()
sponj_client = SponjClient()
openai_client = OpenAIClient()
tripo3d_client = Tripo3dClient()

path_to_uid = {}
glb_task_to_path = {}
obj_task_to_path = {}
