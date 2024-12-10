// custom imports
import { selector } from "../state";
import { meshToolType } from "../types";
import { usePlaygroundStore } from "../state/store";

// third party
import { useShallow } from "zustand/shallow";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { OrbitControls, TransformControls } from "@react-three/drei";

type CanvasControlsProps = {
}

export function CanvasControls({}: CanvasControlsProps) {
    const orbitRef = useRef<any>()
    const transformRef = useRef<any>()
    const scene = useThree((state) => state.scene)

    const {tool, selected} = usePlaygroundStore(useShallow(selector))

    useEffect(() => {
        if (transformRef.current) {
            const callback = (event: { value: boolean }) => {
                // console.log(transformRef.current)
                orbitRef.current.enabled = !event.value
            }
            
            transformRef.current?.addEventListener("dragging-changed", callback)
            return () => transformRef.current?.removeEventListener("dragging-changed", callback)
        }
    })
    
    const object = scene.getObjectByName(selected)
    const meshTool: meshToolType | undefined = useMemo(() => ["rotate", "scale", "translate"].includes(tool)? tool as meshToolType : undefined, [tool])
    
    return (
        <>
        {selected && meshTool && object &&
            <TransformControls 
                object={object} 
                mode={meshTool} 
                ref={transformRef}
            />
        }
        <OrbitControls makeDefault maxDistance={9} ref={orbitRef}/>
        </>
    )
}