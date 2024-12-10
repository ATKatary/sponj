"""
Playground models
"""
import os
import pymeshlab
import numpy as np 
from django.db import models
from typing import Dict, List
from typing_extensions import override
from data.schema import SponjMeshSchema
from utils.models.perm import PermModel, BaseModel
from utils import BASE_DIR, base64_to_bytes, APP_URL

class Mesh(BaseModel):
    labels = models.TextField(blank=True, null=True)
    path = models.CharField(max_length=255, blank=True, null=True)
    gif = models.ImageField(upload_to="mesh_gifs", blank=True, null=True)
    title = models.CharField(max_length=255, blank=True, null=True, default="Unnamed Mesh")
    
    parent_mesh = models.ForeignKey("Mesh", on_delete=models.CASCADE, blank=True, null=True, name="parent_mesh")

    def segment(self, labels: List[int]):
        self.labels = labels
        self.save()

        mesh_json = self.json()

        n = len(set(labels)) 
        segments_faces = {i: [] for i in range(n)} 

        for i in range(len(labels)):
            segments_faces[labels[i]].append(mesh_json["faces"][i])
        
        ms = pymeshlab.MeshSet()
        for i, faces in segments_faces.items():
            seen = {}
            colors = []
            vertices = []
            remapped_faces = []
            for face in faces:
                remapped_face = []

                for v in face:
                    if v not in seen:
                        seen[v] = len(vertices)
                        vertices.append(mesh_json["vertices"][v])
                        colors.append(mesh_json["colors"][v] + [1.0])

                    remapped_face.append(seen[v])
                remapped_faces.append(remapped_face)

            mesh = pymeshlab.Mesh(
                v_color_matrix=np.array(colors),
                vertex_matrix=np.array(vertices),
                face_matrix=np.array(remapped_faces),
            )
            ms.add_mesh(mesh)

            segment_path = f"{self.path.replace('.obj', f'_{i}.obj')}"
            ms.save_current_mesh(segment_path)

            segment = Mesh.objects.create(
                parent_mesh=self,
                path=segment_path,
                title=f"{self.title}_{i}"
            )
            segment.save()
        ms.clear()

    def delete(self):
        if self.gif: self.gif.delete()
        os.remove(self.path)
        super().delete()
    
    @override
    def json(self, meta=False):
        gif = ""
        if self.gif: gif = f"{APP_URL}{self.gif.url}"

        meta_json = {
            "gif": gif,
            "id": str(self.id),
            "title": self.title,
            "segments": [segment.json(meta=True) for segment in Mesh.objects.filter(parent_mesh=self)]
        }

        if meta: return meta_json
        
        ms = pymeshlab.MeshSet()
        ms.load_new_mesh(self.path)

        mesh = ms.current_mesh()
        mesh_json = {
            "faces": mesh.face_matrix().tolist(),
            "vertices": mesh.vertex_matrix().tolist(),
            "normals": mesh.vertex_normal_matrix().tolist(),
            "colors": mesh.vertex_color_matrix()[:, :3].tolist()
        }
        return {**mesh_json, **meta_json}
    
class Playground(PermModel):
    meshes = models.ManyToManyField(Mesh, related_name="meshes", blank=True)

    def add_mesh(self, mesh: SponjMeshSchema):
        faces = mesh.faces
        colors =  mesh.colors
        normals = mesh.normals
        vertices = mesh.vertices

        ms = pymeshlab.MeshSet()
        ms.add_mesh(pymeshlab.Mesh(
            face_matrix=faces,
            v_color_matrix=colors,
            vertex_matrix=vertices,
            v_normals_matrix=normals,
        ))
        new_mesh = Mesh.objects.create()

        gif_bytes = base64_to_bytes(mesh.gif)
        new_mesh.gif.save(f"{new_mesh.id}.gif", gif_bytes)

        path = f"{BASE_DIR}/media/meshes/{new_mesh.id}.obj"
        ms.save_current_mesh(path)

        new_mesh.path = path
        new_mesh.save()
        
        self.meshes.add(new_mesh)

        return new_mesh
    
    def delete(self):
        for mesh in self.meshes.all():
            mesh.delete()
        super().delete()

    @override
    def json(self):
        
        return {
            "id": str(self.id),
            "title": self.title,
            "meshes": [mesh.json(meta=True) for mesh in self.meshes.all()]
        }
