// custom imports 
import { themeType } from "./types"
import { navStateType } from "./nav/types";

// third part 
import { useState } from "react";
import imageResize from 'image-resize'

// theme utils 
export const getPropValue =  (prop: string) => window.getComputedStyle(document.documentElement).getPropertyValue(prop)
export function getTheme(): themeType {
    return {
        bg: {
            primary: getPropValue('--bg-primary'),
            secondary: getPropValue('--bg-secondary')
        },
        font: {
            primary: getPropValue('--font-color-primary'),
            secondary: getPropValue('--font-color-secondary')
        }
    }
}

// state management utils
export function useCustomState<T>(initialState: any): [T, (newState: any) => any] {
    const [state, setState] = useState(initialState);
    const setCustomSate = (newState: any) => {
        setState((prevState: any) => ({...prevState, ...newState}))
    };
    
    return [state, setCustomSate];
}

export function constructUrl(url: string, args: Object) {
    url += "?";
    for (const [arg, value] of Object.entries(args)) {
        url += `${arg}=${value}&`
    }

    return url
}

export function stateToUrl(state: navStateType) {
    let url = `/${state.id}`

    while (state.prevState) {
        url = `${url}/${state.prevState.id}`
        state = state.prevState
    }

    return url
}

// local storage utils
export function addToLocalStorage(key: string, value: string) {
    console.log(`[addToLocalStorage] >> adding ${key}...`)
    try {

        localStorage.setItem(key, value);
    } catch (error) {
        clearLocalStorage();
        localStorage.setItem(key, value);
    }
}

export function clearLocalStorage() {
    console.log(`[clearLocalStorage] >> clearing...`)
    const permanent: string[] = [];
    const n = localStorage.length;

    for (let i = 0; i < n; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        if (permanent.includes(key)) continue;
        localStorage.removeItem(key);
    }
}

export async function tryCache<T>(url: string, id: string, cache: boolean = true, useCached: boolean = true, cacheId?: string): Promise<T> {
    if (useCached) {
        const cachedResponse = window.localStorage.getItem(cacheId || id)
        if (cachedResponse) {
            console.log(`Using cached ${id}`)
            return JSON.parse(cachedResponse) as T
        }
    }
    
    const response = (await (await fetch(constructUrl(url, {id}), {method: "GET", })).json()) as T

    if (cache) addToLocalStorage(id, JSON.stringify(response))
    return response
}

// img utils
export function img2Base64(img: Blob, callback: (url: string) => void) {
    var reader = new FileReader();
    reader.onloadend = function() {
      if (typeof reader.result === 'string') return callback(reader.result)
    }
    reader.readAsDataURL(img);
}

// array utils 
export function get(a: any, key: string): any {
    return key.split('.').reduce((curr, key) => curr[key], a)
}

export function equals<T>(a: any, b: any, keys: string[], bKeys?: string[]): boolean {
    return keys.reduce((curr, key, i) => curr && (get(a, key) === get(b, (bKeys && bKeys[i]) || key)), true)
}
export function find<T>(A: any[], a: any, keys: string[], aKeys?: string[]): T | undefined {
    return A.find(Ai => equals(Ai, a, keys, aKeys))
}

/**
 * Filters an array based on the comparison of specified object properties.
 * 
 * @param A - The array to filter.
 * @param a - The object to compare each element against.
 * @param keys - The keys of the properties to compare.
 * @param aKeys - Optional. The keys of the object `a` to compare against `keys`.
 * @param check - A function to determine which elements to include based on the comparison result, defaults to `!eq`.
 * @returns A new array containing elements for which the `check` function returns true.
 */
export function filter<T>(A: any[], a: any, keys: string[], aKeys?: string[], check = (eq: boolean) => !eq): T[] {
    return A.filter(Ai => check(equals(Ai, a, keys, aKeys))) as T[]
}

export function any<T>(A: T[], B: T[], check = (eq: boolean) => eq): boolean {
    return A.reduce((curr, a) => curr || B.reduce((curr, b) => curr || check(a === b), false), false)
}

export function map<T>(A: T[], mapFn: (a: T) => any, defaultValue?: T): T[] {
    const B: T[] = []

    let a = defaultValue
    for (let i = 0; i < A.length; i++) {
        a = mapFn(A[i]) || a
        if (a) B.push(a)
    }
    return B

}

// object utils
export function filterObj<T>(A: any, removeKeys: string[] = [], setKeys: any = {}): T {
    const B: any = {...A}
    for (const key of removeKeys) delete B[key]

    for (const [key, value] of Object.entries(setKeys)) {
        B[key] = A[key] || value
    }

    return B as T
}

export function update<T>(A: any[], a: any, keys: string[], updates: any, aKeys?: string[]): T[] {
    return A.map(Ai => {
        if (equals(Ai, a, keys, aKeys)) {
            const Aii = {...Ai} 
                
            for (const [key, value] of Object.entries(updates)) {
                switch (typeof value) {
                    case "object":
                        Aii[key] = {...Aii[key], ...value}
                        break;
                    default:
                        Aii[key] = value
                }
            }

            return Aii
        } return Ai
    })
}


export function resizeImage(img: File, callback: (img: Blob) => any): void {
    const imgData = new Image()
    imgData.src = URL.createObjectURL(img)

    imgData.onload = async function() {
        const height = imgData.height;
        const width = imgData.width;
        
        const hToW = width / height;
        const wToH = height / width;
        
        const options = {
            width: 1024,
            height: 1024,
            outputType: "blob" as any
        }

        if (width > height) {
            options.height = Math.floor(wToH * 1024)
        } else {
            options.width = Math.floor(hToW * 1024)
        }

        const resizedImgBlob = await imageResize(img, options) as Blob
        callback(resizedImgBlob)
    }
}