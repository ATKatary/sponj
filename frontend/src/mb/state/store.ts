// custom imports
import { MoodBoardState } from "."
import { CycleDetected, NodeInputMissing } from "../errors"
import { edgeType, mbType, nodeStatusType, nodeType } from "../types"
import { dfs, isValidNode, onDelete, onStatusUpdate } from "../utils"
import { addToLocalStorage, filter, find, stateToUrl, update } from "../../utils"
import { editMoodboard, getMoodboard, getNodeData, getNodeStatus, uploadImgSafe } from "../api"

// third party
import { create } from "zustand"
import { generateUUID } from "three/src/math/MathUtils"
import { Edge, Node, addEdge, applyEdgeChanges, applyNodeChanges } from "@xyflow/react"

export const useMoodboardStore = create<MoodBoardState>((set, get) => ({
    id: "",
    title: "",
    nodes: [],
    edges: [],

    addedNodes: [],
    deletedNodes: [],

    addedEdges: [],
    deletedEdges: [],

    nodeStatus: new Map(),

    active: "",
    setActive: (active) => set({active: active}),

    init: async (mb) => {
        const nodeStatus = new Map<string, nodeStatusType>()
        
        for (let i = 0; i < mb.nodes.length; i++) {
            const node = mb.nodes[i]
            switch (node.type) {
                default:
                    nodeStatus.set(node.id, node.status)
                    break
            }   
        }

        set({
            ...mb,
            addedNodes: [],
            deletedNodes: [],

            addedEdges: [],
            deletedEdges: [],

            nodeStatus: nodeStatus
        })

        get().initNodeData(mb)
    },

    async initNodeData(mb) {
        const state = get()
        const nodeStatus = new Map<string, nodeStatusType>()
        
        for (let i = 0; i < mb.nodes.length; i++) {
            const node = mb.nodes[i]
            if (state.nodeStatus.get(node.id) === "pending") {
                try {
                    nodeStatus.set(node.id, (await getNodeStatus(node.id)).status)
        
                    if (node.type) {
                        mb.nodes[i].data = await getNodeData(node.data.id)    
                    }
                } catch (error) {
                    mb = await getMoodboard(mb.id, true, false)
                    return get().init(mb)
                }
            }

        }
        set({...mb, nodeStatus})
    },
    
    addNode: async (node, status) => {
        const state = get()
        console.log(`[addNode] >> adding node ${node.id}...`)
    
        set({
            nodes: [...state.nodes, {...node, status} as Node],
            nodeStatus: onStatusUpdate(state.nodeStatus, node.id, "pending"),
            addedNodes: [...state.addedNodes, {...node, status} as nodeType],
        })
        
        await state.save()
        set({
            nodeStatus: onStatusUpdate(state.nodeStatus, node.id, status),
        })

    },
    onNodesDelete: (nodes) => {
        const state = get()
        const {added, deleted} = onDelete<nodeType>(nodes, state.addedNodes, state.deletedNodes, ['id'])

        set({
            addedNodes: added, 
            deletedNodes: deleted
        })

        state.save()
    },
    onNodesChange: (changes) => {
        const state = get()
        set({
            nodes: applyNodeChanges(changes, state.nodes),
            addedNodes: applyNodeChanges(changes, state.addedNodes) as nodeType[],
        });
    },
    onNodeDragStop: () => {
        const state = get()
        state.save()
    },

    updateNodeData: (id, data) => {
        const state = get()

        const node: nodeType | undefined = find<nodeType>(state.nodes, {id}, ['id'])
        if (!node) return
        
        set({
            nodes: update<Node>(state.nodes, {id}, ['id'], {data}),
            addedNodes: update<nodeType>(state.addedNodes, {id}, ['id'], {data}),
        })
        
        switch (node.type) {
            case "img":
            case "sketch":
                if (data.img instanceof File) {
                    uploadImgSafe(state.id, node.id, data.img)
                }
                break
            case "txt":
                state.save()
                break
            default: break
        }
    },
    getUpdatedNodes: () => {
        const state = get()

        return state.nodes.filter((node) => !find(state.addedNodes, node, ['id'])) as nodeType[]
    },
    
    setNodeStatus: (id, status) => {
        console.log(`[setNodeStatus] >> setting status for ${id} to ${status}`)
        
        const state = get()
        set({
            nodeStatus: onStatusUpdate(state.nodeStatus, id, status),
            nodes: update<nodeType>(state.nodes, {id}, ['id'], {deletable: status !== 'pending'}),
        })

        const cached = localStorage.getItem(state.id)
        if (cached) {
            const mb = JSON.parse(cached)

            if (find(mb.nodes, {id}, ['id'])) {
                mb.nodes = update<nodeType>(mb.nodes, {id}, ['id'], {status})
                addToLocalStorage(state.id, JSON.stringify(mb))
            }
        }
    },

    onConnect: (conn) => {
        const state = get()
        set({
            edges: addEdge(conn, state.edges),
            addedEdges: [...state.addedEdges, {...conn, id: generateUUID()} as edgeType]
        })
        state.save()
    },
    onEdgesDelete: (edges) => {
        const state = get()
        const {added, deleted} = onDelete<edgeType>(edges, state.addedEdges, state.deletedEdges, ['source', 'target', 'sourceHandle', 'targeHandle'])
        
        set({
            addedEdges: added, 
            deletedEdges: deleted
        })
        state.save()
    },
    onEdgesChange: (changes) => {
        const state = get()
        set({
            edges: applyEdgeChanges(changes, state.edges),
            addedEdges: applyEdgeChanges(changes, state.addedEdges) as edgeType[],
        });
    },
    isValidConnection: (edge) => {
        if (!edge.sourceHandle) return false

        const state = get()
        if (find(state.edges, edge, ['source', 'target', 'sourceHandle', 'targeHandle'])) return false

        switch (edge.targetHandle) {
            case "prompt":
                if (edge.sourceHandle !== "txt") return false
                break
            case "style":
                return false
                // if (edge.sourceHandle === "mesh") return false 
                // break 
            case "mesh":
                break 
            case "geometry":
                const target: Node | undefined = find<Node>(state.nodes, edge, ['id'], ['target'])
                if (!target) return false 

                const geoConns: Edge[] = filter(
                    state.edges, 
                    {
                        target: target?.id, 
                        targetHandle: "geometry", 
                    }, 
                    ['target', 'targetHandle'],
                    undefined, 
                    (eq) => eq
                )
                if (geoConns.length == 1 && geoConns[0].source !== edge.source) return false 
                if (edge.sourceHandle === "mesh") return false
                break 
            default: break
        }
        return true 
    },

    getPath: (start) => {
        console.log(`[getPath] >> finding path for ${start}...`)

        const state = get()
        const node = find<Node>(state.nodes, {id: start}, ['id'])
        if (!node) return []
        
        try {

            const path = dfs(state.nodes, state.edges, node)
            
            state.isValidPath(path)
            return path
        } catch (error) {
            if (error instanceof CycleDetected) {
                console.error(error.message)
                return []
            }
            throw error
        }
    },

    isValidPath(path) {
        const state = get()

        for (let i = 0; i < path.length; i++) {
            const [node, edges] = path[i]
            switch (node.type) {
                case "generatedImg":
                    const img_geo_edge = find<Edge>(edges, {targetHandle: "geometry"}, ['targetHandle'])
                    
                    if (img_geo_edge) {
                        const img_geo_source = find<Node>(state.nodes, {id: img_geo_edge?.source}, ['id'])

                        isValidNode(img_geo_source)   
                    } else {
                        throw new NodeInputMissing(node.id, "geometry")
                    }
                    break 

                case "mesh":
                    const mesh_geo_edge = find<Edge>(edges, {targetHandle: "geometry"}, ['targetHandle'])
                    if (mesh_geo_edge) {
                        const mesh_geo_node = find<Node>(state.nodes, {id: mesh_geo_edge?.source}, ['id'])

                        isValidNode(mesh_geo_node)   
                    } else{
                        throw new NodeInputMissing(node.id, "geometry")
                    }
                    break
                default: break
            }
        }
        console.log(`[isValidPath] >> valid path detected...`)
        return true
    },

    save: async () => {
        const state = get()
        const updatedNodes = state.getUpdatedNodes()

        if (
            !updatedNodes.length && 
            !state.deletedNodes.length && 
            !state.addedNodes.length && 
            !state.deletedEdges.length 
            && !state.addedEdges.length
        ) return 
        
        const mb = await editMoodboard(
            state.id, 
            state.title, 
            updatedNodes, 
            state.deletedNodes, 
            state.addedNodes, 
            state.deletedEdges, 
            state.addedEdges
        )
        
        const nodes: nodeType[] = []
        for (const node of state.nodes) {
            if (state.deletedNodes.includes(node.id)) continue
            const added_node = find<nodeType>(state.addedNodes, node, ['id'])
            nodes.push({...node, data: {...node?.data, ...added_node?.data}} as nodeType)
        }
        
        set({
            nodes: nodes,

            addedNodes: [],
            deletedNodes: [],
            
            addedEdges: [],
            deletedEdges: [],   
        })
    }
                            
}))