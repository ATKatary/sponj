import { projectType } from "../../project/types"

export interface UserState {
    id: string
    name: string
    email: string
    projects: projectType[]
    
    init: (uid: string) => void
}

export const selector = (state: UserState) => ({
    id: state.id,
    name: state.name,
    email: state.email,
    projects: state.projects,

    init: state.init,
})