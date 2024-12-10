"""
Project models
"""
from django.db import models
from typing_extensions import override
from moodboard.models import Moodboard
from utils.models.perm import PermModel

class Project(PermModel):
    moodboards = models.ManyToManyField(Moodboard, related_name="moodboards", blank=True)

    @override
    def json(self):
        return {
            "id": self.id,
            "title": self.title,
            "mbs": [moodboard.json() for moodboard in self.moodboards.all()]
        }
    
    def delete(self):
        for moodbard in self.moodboards.all():
            moodbard.delete()
        super().delete()
