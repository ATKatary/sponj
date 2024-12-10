import { mbMetaType } from "../../mb/types"

export interface ProjectState {
    id: string
    title: string
    mbs: mbMetaType[]
    
    init: (pid: string) => void
}

export const selector = (state: ProjectState) => ({
    id: state.id,
    mbs: state.mbs,
    title: state.title,

    init: state.init,
})