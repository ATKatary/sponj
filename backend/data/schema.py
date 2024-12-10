from ninja import Schema
from ninja.files import UploadedFile
from typing import List, Optional

class PositionSchema(Schema):
    x: float
    y: float

class DataSchema(Schema):
    id: str
    title: str
    src: str = None

class NodeSchema(Schema):
    id: str
    type: str
    data: DataSchema
    status: str = "ready"
    position: PositionSchema 

class EdgeSchema(Schema):
    id: str
    source: str 
    target: str
    sourceHandle: str
    targetHandle: str

class SponjMeshSchema(Schema):
    gif: str

    faces: List[List[int]]
    colors: List[List[float]]
    normals: List[List[float]]
    vertices: List[List[float]]

class NotifyNodeSchema(Schema):
    img: str | None 
    mesh: SponjMeshSchema | None 

class NotifyMeshSchema(Schema):
    labels: List[int] | None