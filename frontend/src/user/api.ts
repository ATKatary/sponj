import { userType } from "./types"
import { addToLocalStorage, constructUrl } from "../utils"

const url = "http://localhost:8000/api/user"

export async function getUser(id: string): Promise<userType> {
    const user = (await (await fetch(constructUrl(url, {id}), {method: "GET"})).json()) as userType
    
    for (const project of user.projects || []) {
        addToLocalStorage(project.id, JSON.stringify(project))
    }   

    return user
}