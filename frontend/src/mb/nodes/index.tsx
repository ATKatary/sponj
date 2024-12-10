import TxtNode from "./in/txt"
import MeshNode from "./out/mesh"
import { GeneratedImgNode } from "./out/img"
import { UploadNodeConstructor } from "./in/upload"

import "../../assets/css/nodes.css"

export const nodeTypes = {
    // input nodes 
    sketch: UploadNodeConstructor("sketch", ["sketch"]), 
    img: UploadNodeConstructor("img", ["img"]), 
    txt: TxtNode,

    // output nodes
    mesh: MeshNode,
    generatedImg: GeneratedImgNode

    // editor nodes
    // remesh: RemeshNode
    // texture: TextureNode
    // segment: SegmentNode

    // multi-mesh nodes 
    // playground: PlaygroundNode
}


export const initNodeStatus: any = {
    sketch: "static",
    img: "static",
    txt: "static",

    mesh: "ready",
    generatedImg: "ready"
}