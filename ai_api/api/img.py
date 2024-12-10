import base64
import requests

from PIL import Image

from utils.img import base64_to_img
from api.schema import Geometry, Style
from api.vars import (
    sd_client, 
    path_to_uid,
    sponj_client, 
    openai_client 
)

def generate_img(path_id: str, geo: Geometry, style: Style):
    if geo.prompt:
        prompt = geo.prompt 
        gen_img = sd_client.text_to_img(prompt)
        img_no_bg = sd_client.remove_bg(gen_img)
        on_img_generated(path_id, img_no_bg)
        return img_no_bg

    else:
        if geo.img:
            img = base64_to_img(geo.img)
        
        if geo.sketch:
            img = base64_to_img(geo.sketch)
            img = sd_client.sketch_to_img(img)

        caption = openai_client.caption(img)
        structured_img = sd_client.structure(img, f"{caption}. high resolution, 8k, photorealistic")
        
        img_no_bg = sd_client.remove_bg(structured_img)

        on_img_generated(path_id, img_no_bg)
        return img_no_bg

def on_img_generated(path_id: str, img: Image):
    uid = path_to_uid[path_id]
    sponj_client.send_img(uid, path_id, img)