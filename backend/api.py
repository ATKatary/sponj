import io
import asyncio
from ninja import NinjaAPI, File
from ninja.files import UploadedFile
from channels.layers import get_channel_layer

api = NinjaAPI()
