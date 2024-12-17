from utils.img import base64_to_img
from api.schema import Geometry, Style
from api.vars import (
    openai_client 
)

def parse_style(style: Style):
    style_prompt, style_img = None, None
    if style.prompt:
        style_prompt = style.prompt
    elif style.img or style.generatedImg:
        if style.img:
            style_img = base64_to_img(style.img)
        elif style.generatedImg:
            style_img = base64_to_img(style.generatedImg)
        style_prompt = openai_client.caption(style_img)

    return style_prompt