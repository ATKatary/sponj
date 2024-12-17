// custom imports
import { loadingType } from "../../types"
import { meshType, playgroundType, playgroundModeType, playgroundToolType } from "../types"

// third party 
import { Vector3, Euler } from "three"

export interface PlaygroundState {
    id: string
    title: string
    selected: string
    meshes: meshType[]
    loading: loadingType
    highlighted: string[]
    mode: playgroundModeType
    tool: playgroundToolType 

    init: (playground: playgroundType) => void
    
    deleteMesh: (id?: string) => void
    addMesh: (data: meshType) => void
    getUpdatedMeshes: () => meshType[]
    updateMesh: (id: string, mesh: {title?: string, position?: Vector3, rotation?: Euler, scale?: Vector3, mtlUrl?: string, textureUrl?: string}) => void

    setSelected: (id: string) => void   
    addHighlight: (id: string) => void
    removeHighlight: (id: string) => void
    setLoading: (loading: loadingType) => void
    setMode: (mode: playgroundModeType) => void
    setTool: (tool: playgroundToolType) => void
}

export const selector = (state: PlaygroundState) => ({
    id: state.id,
    mode: state.mode,
    tool: state.tool,
    title: state.title,
    meshes: state.meshes,
    loading: state.loading,
    selected: state.selected,
    highlighted: state.highlighted,

    init: state.init,

    addMesh: state.addMesh,
    deleteMesh: state.deleteMesh,
    updateMesh: state.updateMesh,
    getUpdatedMeshes: state.getUpdatedMeshes,

    setMode: state.setMode,
    setTool: state.setTool,
    setLoading: state.setLoading,
    setSelected: state.setSelected,
    addHighlight: state.addHighlight,
    removeHighlight: state.removeHighlight
})