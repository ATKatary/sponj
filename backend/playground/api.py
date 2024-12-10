"""
Playground api
"""
import pymeshlab
from api import api
from utils import get
from playground.models import Mesh, Playground

mesh_set = pymeshlab.MeshSet()
@api.get("/playground")
def get_playground(request, id: str):
    return get(Playground, id)

@api.get("/playground/mesh")
def get_mesh(request, id: str):
    return get(Mesh, id)
