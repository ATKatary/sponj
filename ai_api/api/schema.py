from pydantic import BaseModel 
from typing import List, Optional

class RequestModel(BaseModel):
    uid: str 
    path_id: str
    
class Geometry(BaseModel):
    img: Optional[str]
    sketch: Optional[str]
    prompt: Optional[str]
    generatedImg: Optional[str]

class Style(BaseModel):
    img: Optional[str]
    sketch: Optional[str]
    prompt: Optional[str]
    generatedImg: Optional[str]

class MeshRequest(RequestModel):
    geo: Geometry
    style: Style

class ImgRequest(RequestModel):
    geo: Geometry
    style: Style

class SegmentRequest(RequestModel):
    faces: List[List[int]]
    vertices: List[List[float]]