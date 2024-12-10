import { Node, Edge } from "@xyflow/react"
import { playgroundType } from "../playground/types"

export type edgeType = Edge & {
    id: string
}

export type nodeStatusType = "ready" | "done" | "error" | "running" | "pending" | "static"
export type nodeTypes = "img" | "sketch" | "txt" | "mesh" | "generatedImg" | "segment" | "playground" | "remesh" | "texture"

export type nodeType = Node & {
    data: nodeDataType
    status: nodeStatusType
}

export type mbMetaType = {
    id: string
    title: string
}
export type mbType = mbMetaType & {
    nodes: nodeType[]
    edges: edgeType[]
}

export type nodeDataType = {
    id: string
    src?: string
    title: string
    img?: string | File
    playground?: playgroundType
}

export type partialNodeDataType = {
    id: string
    src?: string
}