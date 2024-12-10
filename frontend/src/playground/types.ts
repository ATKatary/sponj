// custom imports
import { Material, Mesh, Quaternion, Vector3 } from "three"

// third party

export type meshType = Mesh & {
    id: string
    title: string
    material: Material  
    
    gif: string 
    
    faces: number[][]
    colors: number[][]
    normals: number[][]
    vertices: number[][]

    segments: meshType[] 
} 

export type playgroundType = {
    id: string,
    title: string, 
    meshes: meshType[]
}

export type playgroundModeType = "mesh" | "wireframe"

export type meshToolType = "rotate" | "translate" | "scale"
export type playgroundToolType = meshToolType | "grab" | "segment" | "stylize" | "vertexSelector"

export type meshTransformType = {
    scale: Vector3
    position: Vector3
    quaternion: Quaternion
}