// custom imports
import { updateMoodboard, updateProject } from "./utils"
import { mbType, nodeType, edgeType, nodeStatusType, nodeDataType } from "./types"
import { tryCache, addToLocalStorage, constructUrl, filterObj, update, find, resizeImage } from "../utils"

// third party
import { Edge } from "@xyflow/react"
import imageResize from 'image-resize'
import { generateUUID } from "three/src/math/MathUtils"

const IN_NODES = ["img", "txt", "sketch"]
const mbUrl = `${process.env.REACT_APP_BACKEND_URL}/mb`
const dataUrl = `${process.env.REACT_APP_BACKEND_URL}/data`

export async function getMoodboard(id: string, cache: boolean = true, useCached: boolean = true): Promise<mbType> {
    return await tryCache<mbType>(mbUrl, id, cache, useCached)
}

export async function getNodeData(id: string): Promise<nodeDataType> {
    return await tryCache<nodeDataType>(dataUrl, id, false, false)
}

export async function getNodeStatus(id: string): Promise<{status: nodeStatusType}> {
    return await tryCache<{status: nodeStatusType}>(`${dataUrl}/status`, id, false, false)
}

export async function createMoodboard(pid: string): Promise<mbType | void> {
    const mb = await (await fetch(constructUrl(`${mbUrl}/create`, {pid}), {
        method: "POST", 
        headers: {"Content-Type": "application/json"}
    })).json() as mbType

    if (!mb) return 
    updateProject(pid, (project) => ({...project, mbs: [...project.mbs, mb]}))
    addToLocalStorage(mb.id, JSON.stringify(mb))
    return mb
}

export async function deleteMoodboard(id: string) {
    const pid = await (await fetch(constructUrl(`${mbUrl}/delete`, {id}), {
        method: "DELETE", 
        headers: {"Content-Type": "application/json"}
    })).text()

    updateProject(pid, (project) => ({...project, mbs: project.mbs.filter((mb) => mb.id !== id)}))
    localStorage.removeItem(id);
}

export async function editMoodboard(
    id: string, 
    title: string, 

    nodes: nodeType[] = [], 

    deleted_nodes: string[] = [], 
    added_nodes: nodeType[] = [], 

    deleted_edges: string[] = [], 
    added_edges: edgeType[] = []
): Promise<mbType | void> {

    const nodes_filtered = nodes.map(node => ({...node, data: filterObj<nodeDataType>(node.data, ["playground", "img"])}))
    const added_nodes_filtered = added_nodes.map(node => ({...node, data: {...filterObj<nodeDataType>(node.data, ["playground", "img"], {id: generateUUID()})}}))

    const {pid, mb} = await (await fetch(constructUrl(`${mbUrl}/edit`, {id, title}), {
        method: "PUT", 
        body: JSON.stringify({
            nodes: nodes_filtered,
            
            deleted_nodes, 
            added_nodes: added_nodes_filtered, 

            deleted_edges,  
            added_edges
        }), 
        headers: {"Content-Type": "application/json"}
    })).json() as {pid: string, mb: mbType}

    if (!mb) return 

    updateProject(pid, (project) => ({...project, mbs: project.mbs.map((projectMB) => {
            if (projectMB.id === id) return mb
            return projectMB
        })}
    ))
    addToLocalStorage(id, JSON.stringify(mb))

    return mb;
}

export async function runPath(uid: string, mid: string, path: [nodeType, Edge[]][]): Promise<[string, nodeStatusType][]> {
    path = path.map(([node, edges]) => ([{...node, data: filterObj<nodeDataType>(node.data, ["playground", "img"])}, edges]))

    const nodeStatus = await (await fetch(constructUrl(`${mbUrl}/runPath`, {uid, mid, is_demo: process.env.REACT_APP_IS_DEMO}), {
        method: "POST", 
        body: JSON.stringify(path),
        headers: {"Content-Type": "application/json"}
    })).json() as [string, nodeStatusType][]

    return nodeStatus
}

export async function uploadImg(mid: string, id: string, img: File): Promise<string> {
    console.log(`[uploadImg] >> uploading image (${img.size} bytes)...`)
    const data = new FormData()
    data.append("img", img)

    const url = await (await fetch(constructUrl(`${dataUrl}/upload/img`, {id}), {
        method: "POST", 
        body: data
    })).json()

    updateMoodboard(mid, (mb) => ({
        ...mb, 
        nodes: update<nodeType>(mb.nodes, {id}, ['id'], {data: {img: url}})
    }))

    return url
}

export async function uploadImgSafe(mid: string, id: string, img: File): Promise<string> {
    if (img.size > 1024 * 1024) {
        resizeImage(img, (resizedImgBlob) => {
            uploadImg(mid, id,  new File([resizedImgBlob], img.name))
        })
    } else {
        uploadImg(mid, id, img)
    } 
    return ""
}