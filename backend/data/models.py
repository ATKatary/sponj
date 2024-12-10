"""
Data models
"""
from PIL import Image
from io import BytesIO
from django.db import models
from user.models import CustomUser
from typing_extensions import override
from utils.models.base import BaseModel
from data.schema import SponjMeshSchema
from playground.models import Playground
from utils import ALPHABET_SIZE, APP_URL, img_to_bytes

class Data(BaseModel):
    src = models.TextField(blank=True, null=True)
    img = models.ImageField(upload_to="imgs", blank=True, null=True)
    title = models.CharField(max_length=ALPHABET_SIZE, default="Unnamed Data")
    task_id = models.CharField(max_length=ALPHABET_SIZE, blank=True, null=True)
    playground = models.ForeignKey(Playground, on_delete=models.CASCADE, blank=True, null=True)
    
    def get_img_bytes(self):
        if self.img:
            with self.img.open("rb") as img_file:
                return img_file.read()
        return None

    def delete(self):
        if self.img: self.img.delete()
        super().delete()

    @override
    def json(self):
        img = ""
        if self.img: img = f"{APP_URL}{self.img.url}"

        return {
            "id": str(self.id),
            "title": self.title,
            
            "img": img,
            "src": self.src,
            "playground": self.playground.json() if self.playground else None
        }

    @override
    def __str__(self):
        return f"{self.title} {'(playground)' if self.playground else ''} ({self.id})"

NODE_TYPES = {
    "img": "image", 
    "txt": "text", 
    "mesh": "mesh", 
    "remesh": "re-mesh", 
    "sketch": "sketch", 
    "segment": "segment", 
    "texture": "texture",
    "playground": "playground", 
    "generatedImg": "generated image"
}

NODE_STATUSES = {
    "done": "done", 
    "ready": "ready", 
    "error": "error", 
    "static": "static",
    "running": "running", 
    "pending": "pending"
}

class Node(BaseModel):
    position = models.JSONField()
    data = models.ForeignKey(Data, on_delete=models.CASCADE)

    type = models.CharField(max_length=ALPHABET_SIZE, choices=NODE_TYPES)
    status = models.CharField(max_length=ALPHABET_SIZE, choices=NODE_STATUSES, default="ready")

    def check_size(self, img_bytes: BytesIO):
        img = Image.open(img_bytes)
        if img.width > 1024 or img.height > 1024:
            h_to_w = img.height / img.width
            w_to_h = img.width / img.height

            if img.width > img.height:
                img = img.resize((1024, int(1024*h_to_w)))
            else:
                img = img.resize((int(1024*w_to_h), 1024))

            img_bytes = BytesIO(img_to_bytes(img))
        return img_bytes
    
    def add_img(self, img_bytes: BytesIO, ext="png"):
        img_bytes = self.check_size(img_bytes)
        self.data.img.save(f"{self.data.id}.{ext}", img_bytes)
        self.data.save()

        return Image.open(img_bytes)
    
    def add_mesh(self, uid: str, mesh: SponjMeshSchema, task_id: str):
        self.data.task_id = task_id
        if self.data.playground is None:
            self.data.playground = Playground.objects.create(owner=CustomUser.objects.get(id=uid))
        self.data.save()

        return self.data.playground.add_mesh(mesh)

    @override
    def json(self):
        return {
            "id": self.id,
            "type": self.type,
            "status": self.status,
            "position": self.position,
            "data": self.data.json(),
        }

    @override
    def __str__(self):
        return f"{self.data.title} ({self.type}) [{self.status}] ({self.id})"
    
class Edge(BaseModel):
    source = models.ForeignKey(Node, on_delete=models.CASCADE, related_name="source")
    target = models.ForeignKey(Node, on_delete=models.CASCADE, related_name="target")

    sourceHandle = models.CharField(max_length=ALPHABET_SIZE)
    targetHandle = models.CharField(max_length=ALPHABET_SIZE)

    @override
    def json(self):
        return {
            "id": self.id,
            "source": self.source.id,
            "target": self.target.id,
            "sourceHandle": self.sourceHandle,
            "targetHandle": self.targetHandle
        }