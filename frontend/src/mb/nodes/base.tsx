// custom imports
import { runPath } from "../api";
import { selector } from "../state";
import { NodeInputMissing } from "../errors";
import { nodeDataType, nodeType, nodeTypes } from "../types";
import { useMoodboardStore } from "../state/store";

// third party
import { useState } from "react";
import { useShallow } from "zustand/shallow";
import { useParams } from "react-router-dom";
import { generateUUID } from "three/src/math/MathUtils";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Edge, Handle, HandleProps, Position } from "@xyflow/react";

type BaseNodeProps = JSX.IntrinsicElements["div"] & {
    id: string
    title: string
    type: nodeTypes

    hasData?: boolean

    sources?: string[]
    targets?: string[]

    onRun?: () => void
}
export default function BaseNode({id, type, hasData, title, targets = [], sources = [], children, className, style, onClick, ...props}: BaseNodeProps) {
    const params = useParams()
    
    const uid = params.uid
    const {
        active, 
        id: mid, 
        nodeStatus, 
        
        setActive, 
        
        getPath, 
        
        setNodeStatus, 
        updateNodeData,

        save
    } = useMoodboardStore(useShallow(selector));

    const status = nodeStatus.get(id)
    // const [currTitle, setCurrTitle] = useState<string>(title)

    return (
        <div 
            style={{...style, backgroundColor: `var(--node-color-${type})`}}
            onClick={(event) => (onClick && onClick(event)) || (active !== id && setActive(id))}
            className={`node ${status === "pending"? "loading-border" : ""} ${active === id ? "active" : ""} ${className}`} 
        >
            <BaseHandle 
                type="target"
                handles={targets}
                position={Position.Left}
            />
            <input value={title} className="node-title" onChange={event => updateNodeData(id, {title: event.target.value})}/>
            
            {status !== "pending" && children}
            {status === "pending" && <div className="spinner" onClick={() => setNodeStatus(id, "ready")}></div>}
            {["mesh", "generatedImg"].includes(type) && status !== "pending" &&!hasData &&
                <FontAwesomeIcon 
                    className="clickable"
                    icon={"fa-solid fa-circle-play" as IconProp} 
                    onClick={(event) => {
                        event.stopPropagation()
                        if (uid) {
                            try {
                                const path: [nodeType, Edge[]][] = getPath(id).map(([node, edges]) => ([
                                    {...node, status: nodeStatus.get(node.id)} as nodeType, edges
                                ]))
                                
                                runPath(uid, mid, path)
                            } catch (error) {
                                if (error instanceof NodeInputMissing) {
                                    return console.error(error.message)
                                }
                                throw error
                            }
                        }
                    }}
                />
            }

            <BaseHandle 
                type="source"
                handles={sources}
                position={Position.Right}
            />
        </div>
    )
}

type BaseHandleProps = HandleProps & {
    handles: string[]
}
function BaseHandle({type, position, handles, className, style, ...props}: BaseHandleProps) {
    return (
        <>
            {handles?.map((handle, i) => {
                const id = generateUUID();
                const top = ((i + 1) * 100) / (handles.length + 1);

                return (
                    <Handle
                        {...props}

                        key={id}
                        type={type}
                        id={handle}
                        position={position}
                        className={`node-handle ${className}`}
                        style={{top: `${top}%`, width: 10, height: 10, ...style}}
                    >
                        {type === "target" && <p>{handle}</p>}
                    </Handle>
                )
            })}
        </>
    )
}