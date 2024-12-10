from typing import List
from utils.segment import SegmentedSponjMesh
from api.vars import sponj_client, path_to_uid

def segment_mesh(path_id: str, vertices: List[List[float]], faces: List[List[int]], k=3) -> str | None:
    mesh = SegmentedSponjMesh(faces=faces, vertices=vertices)

    labels, n, duration = mesh.segment(k=k) # k is the collapse factor, allows segmentation to run in O((n/k)^2log(n/k) + n) instead of O(n^2log(n))
    on_segmented_mesh(path_id, labels)

def on_segmented_mesh(path_id: str, labels: List[int]):
    uid = path_to_uid[path_id]
    sponj_client.send_labels(uid, path_id, labels)