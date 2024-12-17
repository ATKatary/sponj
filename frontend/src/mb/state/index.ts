// custom imports
import { loadingType } from "../../types"
import { nodeStatusType, nodeType, edgeType, mbType } from "../types"

// third party
import { Node, Edge, Connection, EdgeChange, NodeChange } from "@xyflow/react"

export interface MoodBoardState {
    id: string
    title: string
    nodes: Node[]
    edges: Edge[]

    addedNodes: nodeType[]
    deletedNodes: string[]

    addedEdges: edgeType[]
    deletedEdges: string[]

    nodeStatus: Map<string, nodeStatusType>

    init: (mb: mbType) => void
    initNodeData: (mb: mbType) => void

    active?: string
    setActive: (active?: string) => void
    
    onNodeDragStop: () => void
    onNodesDelete: (nodes: Node[]) => void
    onNodesChange: (changes: NodeChange[]) => void
    addNode: (node: Node, status: nodeStatusType) => void

    getUpdatedNodes: () => nodeType[]
    updateNodeData: (id: string, data: Record<string, unknown>) => void

    setNodeStatus: (id: string, status: nodeStatusType) => void

    onConnect: (conn: Connection) => void
    onEdgesDelete: (edges: Edge[]) => void
    onEdgesChange: (changes: EdgeChange[]) => void
    isValidConnection: (edge: Edge | Connection) => boolean

    getPath: (start: string) => [Node, Edge[]][]
    isValidPath: (path: [Node, Edge[]][]) => boolean

    save: () => Promise<void | mbType>

    loading: loadingType
    setLoading: (loading: loadingType) => void
}

export const selector = (state: MoodBoardState) => ({
    id: state.id,
    title: state.title,
    nodes: state.nodes,
    edges: state.edges,

    loading: state.loading,
    setLoading: state.setLoading,
    
    init: state.init,
    initNodeData: state.initNodeData,

    addedNodes: state.addedNodes,
    deletedNodes: state.deletedNodes,

    addedEdges: state.addedEdges,
    deletedEdges: state.deletedEdges,

    nodeStatus: state.nodeStatus,

    active: state.active, 
    setActive: state.setActive,

    addNode: state.addNode,
    onNodesDelete: state.onNodesDelete,
    onNodesChange: state.onNodesChange,
    onNodeDragStop: state.onNodeDragStop,

    updateNodeData: state.updateNodeData,
    getUpdatedNodes: state.getUpdatedNodes,

    setNodeStatus: state.setNodeStatus,

    onConnect: state.onConnect,
    onEdgesChange: state.onEdgesChange,
    onEdgesDelete: state.onEdgesDelete,
    isValidConnection: state.isValidConnection,

    getPath: state.getPath,
    isValidPath: state.isValidPath,

    save: state.save
})