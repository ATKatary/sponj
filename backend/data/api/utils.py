import base64
from data.models import Data

AI_API_URL = "http://localhost:8001/ai"

def parse_data(data):
    data_info = {
        'img': None, 
        'prompt': None, 
        'sketch': None, 
        'generatedImg': None
    }

    if data is None: return data_info

    if data['type'] == "txt":
        data_info['prompt'] = data['src']

    elif data['type'] in {"img", "generatedImg", "sketch"}:
        key = data['type']
        img_bytes = Data.objects.get(id=data['id']).get_img_bytes()
        data_info[key] = base64.b64encode(img_bytes).decode('utf-8')

    else:
        raise ValueError(f"unsupported data type {data['type']}")
    
    return data_info
