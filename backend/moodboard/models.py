"""
Moodboard models
"""
from django.db import models
from typing_extensions import override
from utils.models.perm import PermModel
from data.models import Data, Node, Edge
from data.schema import NodeSchema, EdgeSchema
from django.core.exceptions import ValidationError

class Moodboard(PermModel):
    nodes = models.ManyToManyField(Node, related_name="nodes", blank=True)
    edges = models.ManyToManyField(Edge, related_name="edges", blank=True)

    @override
    def json(self):
        return {
            "id": self.id,
            "title": self.title,
            "nodes": [node.json() for node in self.nodes.all()],
            "edges": [edge.json() for edge in self.edges.all()]
        }   
    
    def add_nodes(self, added_nodes: list[NodeSchema]) -> dict[str, Node]:
        nodes_map = {}
        for node_schema in added_nodes:
            data = Data.objects.create(**node_schema.data.dict(exclude_unset=True))
            node = Node.objects.create(**node_schema.dict(exclude_unset=True, exclude={"data"}), data=data)

            nodes_map[node_schema.id] = node

            data.save()
            node.save()
            self.nodes.add(node)
        
        return nodes_map
    
    def add_edges(self, added_edges: list[EdgeSchema], nodes_map: dict[str, Node]):
        for edge_schema in added_edges:
            try:
                source_node = Node.objects.get(id=edge_schema.source)
            except Exception as error:
                source_node = nodes_map[edge_schema.source]
            
            try:
                target_node = Node.objects.get(id=edge_schema.target)
            except Exception as error:
                target_node = nodes_map[edge_schema.target]
            

            edge = Edge.objects.create(
                **edge_schema.dict(exclude_unset=True, exclude={"id", "source", "target"}), 
                
                source=source_node, 
                target=target_node
            )

            edge.save()
            self.edges.add(edge)
        
    def update_nodes(self, updated_nodes: list[NodeSchema]):
        for node_schema in updated_nodes:
            node = Node.objects.get(id=node_schema.id)
            
            if node_schema.data.src is not None:
                node.data.src = node_schema.data.src

            node.data.title = node_schema.data.title
            node.data.save()

            node.position = node_schema.position.dict()

            node.save()

    def delete(self):
        for node in self.nodes.all():
            node.delete()
        for edge in self.edges.all():
            edge.delete()
        super().delete()

        
    
