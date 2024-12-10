// custom imports
import { ProjectState } from "."

// third party
import { create } from "zustand"
import { getProject } from "../api"

export const useProjectStore = create<ProjectState>((set, get) => ({
    id: "",
    title: "",
    mbs: [],

    init: async (pid: string) => {
        const project = await getProject(pid)
        set({...project})
    }
}))