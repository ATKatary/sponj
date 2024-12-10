import { projectType } from "../project/types"

export type userType = {
    id: string
    name: string
    email: string

    created_at: string
    updated_at: string

    projects?: projectType[]
}