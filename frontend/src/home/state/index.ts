import { loadingType } from "../../types"

export interface HomeState {
    loading: loadingType
    setLoading: (loading: loadingType) => void
}

export const selector = (state: HomeState) => ({
    loading: state.loading,
    setLoading: state.setLoading
})