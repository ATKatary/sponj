from django.apps import AppConfig
from project.models import Project

class Config(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app'

class DataConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'data'

class MoodboardConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'moodboard'

class PlaygroundConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'playground'

class ProjectConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'project'
    def ready(self):
        for project in Project.objects.all():
            print(project.id)
            project.delete()

class UserConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'user'