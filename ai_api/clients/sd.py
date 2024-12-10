from PIL import Image
from requests import Response
from utils.client import BaseClient
from utils import API_KEYS, PROMPTS, BASE_DIR
from utils.img import img_to_bytes, bytes_to_img

SD_API_KEY = API_KEYS['SD_API_KEY']
default_kwargs = {
    'ext': "png",
    'negative_prompt': "", 
    'control_strength': 0.7, 
}

class SDCliet(BaseClient):
    def __init__(self):
        super().__init__()
        self.api_key = SD_API_KEY
        self.headers = {
            'Accept': "image/*",
            'Authorization': f"Bearer {self.api_key}"
        }

        self.base_url = "https://api.stability.ai/v2beta/stable-image"

        self.endpoints = {
            "edit": {
                "inpaint": f"{self.base_url}/edit/inpaint",
                "remove_background": f"{self.base_url}/edit/remove-background",
            },
            "control": {
                "sketch": f"{self.base_url}/control/sketch",
                "structure": f"{self.base_url}/control/structure",
            },
            "generate": {
                "text": f"{self.base_url}/generate/core",
            }
        }

        self.log_path = f"{BASE_DIR}/logs/sd.log"
    
    def check_size(self, img: Image) -> Image:
        if img.width > 1024 or img.height > 1024:
            h_to_w = img.height / img.width
            w_to_h = img.width / img.height

            if img.width > img.height:
                img = img.resize((1024, int(1024*h_to_w)))
            else:
                img = img.resize((int(1024*w_to_h), 1024))
        return img
    
    def remove_bg(self, img: Image, ext = "png", **kwargs) -> Image:
        img = self.check_size(img)

        params = {"output_format" : ext}
        kwargs['files'] = {"image" : img_to_bytes(img)}

        url = self.endpoints["edit"]["remove_background"]
        return self(url, params, **kwargs)
    
    def structure(self, img: Image, prompt: str, **kwargs) -> Image:
        img = self.check_size(img)

        params = {"prompt" : self.process_prompt(prompt)}
        kwargs['files'] = {"image" : img_to_bytes(img)}

        url = self.endpoints["control"]["structure"]
        return self(url, params, **kwargs)

    def process_prompt(self, prompt: str) -> str:
        return f"{prompt}. {PROMPTS['sd']['systemPrompt']}"
    
    def text_to_img(self, prompt: str, ext = "png", **kwargs) -> Image:
        params = {
            "prompt" : self.process_prompt(prompt),
            "output_format": ext
        }
        kwargs['files'] = {'none': None}
        url = self.endpoints["generate"]["text"]
        return self(url, params, default_kwargs={}, **kwargs)
    
    def sketch_to_img(self, img: Image, prompt = PROMPTS['sketchToImg'], **kwargs) -> Image:
        img = self.check_size(img)

        params = {"prompt" : self.process_prompt(prompt)}
        kwargs['files'] = {"image" : img_to_bytes(img)}

        url = self.endpoints["control"]["sketch"]
        return self(url, params, **kwargs)

    def inpaint(self, img: Image, mask: Image, prompt: str, **kwargs) -> Image:
        img = self.check_size(img)
        
        params = {"prompt" : self.process_prompt(prompt)}
        kwargs['files'] = {
            "image" : img_to_bytes(img),
            "mask" : img_to_bytes(mask),
        }
        url = self.endpoints["edit"]["inpaint"]
        return self(url, params, **kwargs)
    
    def __call__(self, url: str, params, default_kwargs = default_kwargs, **kwargs) -> Image:
        post_kwargs = {}
        if 'files' in kwargs:
            post_kwargs['files'] = kwargs.pop('files')
        
        params = {
            **params,
            **default_kwargs,
            **kwargs
        }

        response = self.post(url, params=params, headers=self.headers, **post_kwargs)
        return self.decode(response)

    def decode(self, response: Response) -> Image:
        return bytes_to_img(response.content)
