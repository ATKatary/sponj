// custom imports
import { projectType } from "./types"
import { tryCache, addToLocalStorage, constructUrl } from "../utils"

const url = `${process.env.REACT_APP_BACKEND_URL}/proj`
const projCacheId = (id: string) => `proj_${id}`

export async function getProject(id: string): Promise<projectType> {
    return await tryCache<projectType>(url, id, true, true, projCacheId(id))
}

export async function createProject(uid: string): Promise<projectType> {
    const project = await (await fetch(constructUrl(`${url}/create`, {uid}), {
        method: "POST", 
        headers: {"Content-Type": "application/json"}
    })).json() as projectType

    addToLocalStorage(projCacheId(project.id), JSON.stringify(project))
    return project
}

export async function deleteProject(id: string) {
    await fetch(constructUrl(`${url}/delete`, {id}), {
        method: "DELETE", 
        headers: {"Content-Type": "application/json"}
    })

    localStorage.removeItem(projCacheId(id));
}

export async function editProject(id: string, title: string) {
    if (!id || !title) return 

    await fetch(constructUrl(`${url}/edit`, {pid: id, title}), {
        method: "PUT", 
        headers: {"Content-Type": "application/json"}
    })

    const cachedProject = localStorage.getItem(id)
    if (cachedProject) {    
        const project = JSON.parse(cachedProject) as projectType
        project.title = title
        addToLocalStorage(projCacheId(id), JSON.stringify(project))
    }
}