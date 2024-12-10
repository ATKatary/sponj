import base64
import logging
from PIL import Image
from io import BytesIO
from typing import Dict
from pathlib import Path
from http import HTTPStatus
from django.db import models
from django.core.exceptions import ValidationError

ALPHABET_SIZE = 26
APP_URL = "http://localhost:8000"
BASE_DIR = Path(__file__).resolve().parent.parent

WARN = "warn"
INFO = "info"
ERROR = "error"
FILE = "[utils]"
logger = logging.getLogger('django')

def report(message: str, mode: str = INFO, debug: bool = False):    
    if mode == INFO: logger.info(message)
    if mode == WARN: logger.warn(message)
    if mode == ERROR: logger.debug(message, exc_info=debug)

def get(model: models.Model, id: str, default=-1) -> Dict[str, str | int]:
    try:
        return model.objects.get(id=id).json()
    except model.DoesNotExist:
        if default != -1: return default
        return {"error": f"{model.__name__} does not exist", "status": HTTPStatus.NOT_FOUND}
    except ValidationError:
        if default != -1: return default
        return {"error": f"Invalid {model.__name__} id", "status": HTTPStatus.BAD_REQUEST}

def base64_to_bytes(base64_str: str):
    return BytesIO(base64.decodebytes(bytes(base64_str, "utf-8")))

def img_to_bytes(img: Image):
    img_byte_arr = BytesIO()
    img.save(img_byte_arr, format='PNG')
    return img_byte_arr.getvalue()