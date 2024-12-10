from data.api.img import gen_img
from data.api.mesh import gen_mesh
from data.api.queues import path_meta, path_queue, pending_nodes

def execute_path(uid, path_id):
    if len(path_queue[path_id]) == 0: return
    node_map, is_demo = path_meta[path_id]
    node, edges = path_queue[path_id].pop()

    pending_nodes[path_id] = node.id

    print(f"[execute_path] executing {node.type} node {node.id}...")

    geo, style = None, None
    geo_edge = list(filter(lambda edge: edge.targetHandle == "geometry", edges))
    style_edge = list(filter(lambda edge: edge.targetHandle == "style", edges))
    if node.type == "generatedImg":
        if (node_map[node.id] is None or not node_map[node.id]['img']):
            geo = node_map[geo_edge[0].source]
            
            if style_edge:
                style = node_map[style_edge[0].source]

            gen_img(uid, path_id, node.id, geo, style, is_demo)

        else:
            return execute_path(uid, path_id)
    
    elif node.type == "mesh" and (node_map[node.id] is None or 'faces' not in node_map[node.id]):
        geo = node_map[geo_edge[0].source]
        
        if style_edge:
            style = node_map[style_edge[0].source]
            
        gen_mesh(uid, path_id, node.id, geo, style, is_demo)
    
    elif node.type in {"img", "sketch", "prompt", "txt"}:
        return execute_path(uid, path_id)
    
    if len(path_queue[path_id]) == 0:
        del path_queue[path_id]
        del path_meta[path_id]

