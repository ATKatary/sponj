// custom imports
import { CycleDetected, NodeInputMissing } from "./errors"
import { mbType, nodeStatusType } from "./types"
import { projectType } from "../project/types"
import { addToLocalStorage, filter, find, update } from "../utils"

// third party
import { Node, Edge } from "@xyflow/react"

// store utils
export function onDelete<T>(A: (Node | Edge)[], added: T[], deleted: string[], keys: string[]): {added: T[], deleted: string[]} {
    A.forEach(Ai => {
        if (find(added, Ai, keys)) {
            added = filter<T>(added, Ai, keys)
        } else deleted.push(Ai.id)
    })

    return {added, deleted}
}

export function onStatusUpdate(nodeStatus: Map<string, nodeStatusType>, id: string, status: nodeStatusType) {
    nodeStatus = new Map(nodeStatus)
    nodeStatus.set(id, status)
    return nodeStatus
}

// api utils
export function updateProject(pid: string = "all", update: (proj: projectType) => projectType) {
    if (pid === "all") {
       for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (!key?.startsWith("proj_")) continue;

            const project = JSON.parse(localStorage.getItem(key)!) as projectType
            addToLocalStorage(key, JSON.stringify(update(project)))
        }
        return
    }

    const cachedProject = localStorage.getItem(`proj_${pid}`)
    if (cachedProject) {
        let project = JSON.parse(cachedProject) as projectType
        addToLocalStorage(`proj_${pid}`, JSON.stringify(update(project)))
    }
}

export function updateMoodboard(id: string, update: (mb: mbType) => mbType) {
    const cachedMoodboard = localStorage.getItem(id)
    if (cachedMoodboard) {
        let moodboard = JSON.parse(cachedMoodboard) as mbType

        const updatedMoodboard = update(moodboard)
        addToLocalStorage(id, JSON.stringify(updatedMoodboard))

        updateProject("all", (project) => {
            const mbs = project.mbs.map(mb => mb.id === id ? updatedMoodboard : mb)
            return {...project, mbs}
        })
    }
}

// path finder utils 
export function bfs(nodes: Node[], edges: Edge[], start: Node): Map<Node, Edge[]> {
    const queue: Node[] = [start]
    const seen = new Set<string>([start.id])

    const path = new Map<Node, Edge[]>()
    path.set(start, [])

    const nodeMap = new Map<string, Node>()
    nodes.forEach(node => nodeMap.set(node.id, node))

    while (queue.length > 0) {
        let n  = queue.length
        const m = edges.length

        while (n > 0) {
            const node = queue.shift()
            
            for (let i = m - 1; i >= 0; i--) {
                const edge = edges[i]
                if (edge.target !== node?.id) continue
                
                path.get(node!)!.push(edge)
                if (seen.has(edge.source)) continue

                const source = nodeMap.get(edge.source)
                
                queue.push(source!)
                seen.add(edge.source)
                path.set(source!, [])

                edges.slice(i, 1)
            }
            n--
        }
    }

    console.log("[bfs] (path) >>", path)
    return path
}

export function dfs(nodes: Node[], edges: Edge[], start: Node): [Node, Edge[]][] {
    const path: [Node, Edge[]][] = [[start, []]]
    
    const nodeMap = new Map<string, Node>()
    nodes.forEach(node => nodeMap.set(node.id, node))
    
    const explore = (start: number, seen: Set<string>): void => {
        const m = edges.length

        for (let i = m - 1; i >= 0; i--) {
            const edge = edges[i]
            if (edge.target !== path[start][0].id) continue
            
            const source = nodeMap.get(edge.source)
            if (seen.has(edge.source)) {
                throw new CycleDetected(edge)
            }
            
            seen.add(edge.source)
            path.push([source!, []])
            path[start][1].push(edge)

            edges.slice(i, 1)
            
            const n = path.length
            explore(n - 1, seen)
            seen.delete(edge.source)
        }
    }

    explore(0, new Set<string>([start.id]))
    console.log("[dfs] (path) >>", path)
    return path
}

export function isValidNode(node?: Node) {
    if (!node) return 

    switch (node.type) {
        case "txt":
            if (!node.data?.src) {
                throw new NodeInputMissing(node!.id, "prompt (prompt can not be empty)")
            }
            break
        case "img":
            if (!node.data?.img) {
                throw new NodeInputMissing(node!.id, "img (upload an image)")
            }
            break
        case "sketch":
            if (!node.data?.img) {
                throw new NodeInputMissing(node!.id, "img (upload a sketch)")
            }
            break
        default: break
    }

    return true
}