// custom imports
import { initMesh } from "../api"
import { PlaygroundState } from "."
import { meshType } from "../types"
import { filter, update } from "../../utils"

// third party
import { create } from "zustand"
import { Euler, Quaternion, Vector3 } from "three"

export const usePlaygroundStore = create<PlaygroundState>((set, get) => ({
    id: "",
    title: "",
    meshes: [],
    mode: "mesh",
    selected: "",
    tool: "translate",
    loading: {on: false},

    init: (playground) => {
        set({...playground})
    },

    addMesh: async (data) => {
        const state = get()

        const mesh = await initMesh(data.id)

        set({
            meshes: [
                ...state.meshes, 
                {
                    ...mesh,

                    scale: mesh.scale || new Vector3(1, 1, 1),
                    position:  mesh.position || new Vector3(state.meshes.length*1.5, 0, 0),
                    quaternion:  mesh.quaternion || new Quaternion().setFromEuler(new Euler(0, -2*Math.PI / 3, 0)),
                } as meshType
            ]
        })
    },

    deleteMesh: (id) => {
        if (id) {
            const state = get()
            
            set({
                meshes: filter(state.meshes, {id}, ['id'])
            })
        } else {
            set({meshes: []})
        }
    },

    updateMesh: (id, mesh) => {
        const state = get()
        console.log(`[updateMesh] >> updating mesh ${id}...`)

        console.log(mesh)
        set({
            meshes: update(state.meshes, {id}, ['id'], mesh)
        })
    },

    getUpdatedMeshes: () => {
        return []
    },

    setMode: (mode) => {
        set({mode})
    },

    setTool: (tool) => {
        set({tool})
    },

    setSelected: (selected) => {
        set({selected})
    },

    setLoading: (loading) => {
        set({loading})
    }
}))