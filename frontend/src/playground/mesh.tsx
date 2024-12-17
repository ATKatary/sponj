// custom imports
import { selector } from './state';
import { XSegment } from './segment';
import { useCustomState } from '../utils';
import { usePlaygroundStore } from './state/store';
import { meshTransformType, meshType } from './types';
import { closestK, extractMeshTransform, getMeshTransform, isTransformEqual, subTransform } from './utils';

// 3rd part imports
import { Center } from '@react-three/drei';
import { useShallow } from 'zustand/shallow';
import { GroupProps } from '@react-three/fiber';
import { useRef, useState, useEffect } from 'react';
import { generateUUID } from 'three/src/math/MathUtils';
import { Group, Intersection, Mesh, Object3D, Object3DEventMap, Quaternion, Vector3 } from 'three';


export type XMeshProps = GroupProps & {
    mesh: meshType
    highlight?: boolean
    autoRotate?: boolean
}

export function SMesh({mesh: {id, segments, ...mesh}, autoRotate, ...props}: XMeshProps) {
    const groupRef = useRef<Group>(null!)
    const meshRefs = useRef<(Mesh | null)[]>([])
    
    const { selected } = usePlaygroundStore(useShallow(selector))

    return (
        <group 
            name={id} 
            {...props}
            ref={groupRef} 
        >
            {segments?.map((segment, i) => {
                const MeshComp = segment.segments.length > 0 ? SMesh : XMesh
                return (
                    <MeshComp 
                        mesh={segment} 
                        key={segment.id}
                        highlight={selected === id}
                    />
                )
            })}
        </group>
    )
}

export function XMesh({mesh: {id, segments, ...mesh}, autoRotate, highlight, ...props}: XMeshProps) {
    const [unselectedMesh, setUnselectedMesh] = useCustomState<meshType>({...mesh, id: id})
    const [selectedMesh, setSelectedMesh] = useCustomState<meshType>({id: `${id}-selected`, ...extractMeshTransform(mesh)})

    const nTransform = useRef<meshTransformType>(extractMeshTransform(mesh))
    const sTransform = useRef<meshTransformType>(extractMeshTransform(mesh))

    const { selected } = usePlaygroundStore(useShallow(selector))
    // const [vioi, setVioi] = useState<number[]>([]) // vertex indices of interest

    const onVerticesSelect = (objects: Intersection<Object3D<Object3DEventMap>>[], point: number[]) => {
        const fioi = objects.splice(0, 1).reduce((prev: number[], {faceIndex: i}) => i? [...prev, i] : prev, []) // face indicies of interest
        
        const n = selectedMesh.vertices?.length || 0
        const foi = fioi.map(i => unselectedMesh.faces[i]) // faces of interest
        const rFoi = foi.map((_, i) => [n + 3*i, n + 3*i + 1, n + 3*i + 2]) // remapped faces of interest 
        
        // setVioi([...vioi, ...foi.flat()])
        
        const vioi = foi.flat()
        const kVioi = closestK(vioi.map(i => [i, unselectedMesh.vertices[i]]), point, 1).map(a => a[0])
        const voi = foi.map(face => face.map(i => unselectedMesh.vertices[i])).flat() // verticies of interest
        
        const coi = vioi.map(i => [1, 1, 0]) // colors of interest

        setSelectedMesh({
            faces: [...(selectedMesh.faces || []), ...rFoi],
            colors: [...(selectedMesh.colors || []), ...coi],
            vertices: [...(selectedMesh.vertices || []), ...voi], 
        })
      
        const m = 0
        const nfoi = unselectedMesh.faces.filter((_, i) => !fioi.includes(i)) // not faces of interest
        const rNfoi = nfoi.map((_, i) => [m + 3*i, m + 3*i + 1, m + 3*i + 2]) // remapped not faces of interest 

        const nvioi = nfoi.flat()
        const kNVioi = vioi.filter(i => !kVioi.includes(i))
        const nvoi = nvioi.map(i => unselectedMesh.vertices[i]) // not verticies of interest

        const ncoi = nfoi.map(face => face.map(i => unselectedMesh.colors[i])).flat() // not colors of interest
        setUnselectedMesh({
            faces: rNfoi,
            colors: ncoi,
            vertices: nvoi, 
        })
        // setUnselectedMesh({
        //     colors: unselectedMesh.colors.map((color, i) => foi.flat().includes(i) ? [1, 1, 0] : color),
        // })
    }
    
    return (
        <group name={id} {...props}>
            <group 
                name={selectedMesh.id}
            >
                <XSegment 
                    segment={selectedMesh}
                    highlight={highlight || selected === id}
                    onUpdate={event => {
                        sTransform.current = getMeshTransform(event)
                        if (nTransform.current.position) {
                            const transform = subTransform(sTransform.current, nTransform.current)
                        }
                    }}

                    onPointerMissed={event => {
                        // setSelectedMesh({
                        //     faces: [],
                        //     colors: [],
                        //     vertices: [],
                        // })

                        // setUnselectedMesh({
                        //     faces: mesh.faces,
                        //     colors: mesh.colors,
                        //     vertices: mesh.vertices, 
                        // })
                    }}
                />
            </group>
            <group>
                <XSegment 
                    segment={unselectedMesh}
                    onVerticesSelect={onVerticesSelect}
                    highlight={highlight || selected === id}
                    
                    onUpdate={event => {
                        nTransform.current = getMeshTransform(event) 
                    }}
                />
            </group>
        </group>
    )
}

