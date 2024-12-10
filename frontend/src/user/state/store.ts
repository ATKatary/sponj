// custom imports
import { UserState } from "."

// third party
import { create } from "zustand"
import { getUser } from "../api"

export const useUserStore = create<UserState>((set, get) => ({
    id: "",
    name: "",
    email: "",
    projects: [],

    init: async (uid) => {
        const user = await getUser(uid)
        set({...user})
    }
}))