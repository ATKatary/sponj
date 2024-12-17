import { meshType, playgroundType } from "./types"
import { tryCache, constructUrl } from "../utils"

const dataUrl = `${process.env.REACT_APP_BACKEND_URL}/data`
const playgroundUrl = `${process.env.REACT_APP_BACKEND_URL}/playground`

export async function getPlayground(id: string): Promise<playgroundType> {
    return await tryCache<playgroundType>(playgroundUrl, id, false)
}

// export async function img2Mesh(uid: string, img: File): Promise<void> {
//     const data = new FormData()
//     data.append("file", img)

//     fetch(constructUrl(`http://localhost:8000/api/ai/img2Mesh`, {uid, nid: ""}), {
//         body: data,
//         method: "POST", 
//     })
// }

// export async function txt2Mesh(uid: string, prompt: string): Promise<void> {
//  fetch(constructUrl(`http://localhost:8000/api/ai/txt2Mesh`, {uid, nid: "", prompt}), {
//         method: "POST", 
//     })
// }

export async function segmentMesh(uid: string, mid: string): Promise<void> {
    await fetch(constructUrl(`${dataUrl}/mesh/segment`, {uid, mid}), {
        method: "POST",
    })
}

export async function getMesh(id: string): Promise<meshType> {
    return await tryCache<meshType>(`${playgroundUrl}/mesh`, id, false)
}

export async function initMesh(id: string): Promise<meshType> {
    const mesh = await getMesh(id)

    const segments = []
    for (let i = 0; i < mesh.segments.length; i++) {
        segments.push(await initMesh(mesh.segments[i].id))
    }

    mesh.segments = segments
    return mesh;
} 