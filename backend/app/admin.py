from django.contrib import admin

from data.models import Data, Node, Edge
admin.site.register(Data)
admin.site.register(Node)
admin.site.register(Edge)

from moodboard.models import Moodboard
admin.site.register(Moodboard)

from playground.models import Playground, Mesh
admin.site.register(Mesh)
admin.site.register(Playground)

from project.models import Project
admin.site.register(Project)
