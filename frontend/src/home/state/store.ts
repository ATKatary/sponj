// custom imports
import { HomeState } from "."

// third party
import { create } from "zustand"

export const useHomeStore = create<HomeState>((set, get) => ({
    loading: {on: false},

    setLoading(loading) {
        set({loading})
    },
}))