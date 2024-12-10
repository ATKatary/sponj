// custom imports
import { filter } from "../utils"
import { selector } from "./state"
import { initNodeStatus } from "./nodes"
import { useMoodboardStore } from "./state/store"

// static data
import nodeData from "../assets/data/nodes.json"

// third party
import { useReactFlow } from "@xyflow/react"
import { useShallow } from "zustand/shallow"
import { generateUUID } from "three/src/math/MathUtils"
import { IconProp } from "@fortawesome/fontawesome-svg-core"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

type MoodboardToolbarProps = JSX.IntrinsicElements["div"] & {
    
}
export function MoodboardToolbar({...props}: MoodboardToolbarProps) {
    const flow = useReactFlow()
    const {nodes, addNode} = useMoodboardStore(useShallow(selector))

    return (
        <div className="node-toolbar">
            {Object.entries(nodeData).map(([type, node]) => {
                const id = `${generateUUID()}`

                return (
                    <button 
                        disabled={node.disabled}
                        key={`${type}-create-btn`}
                        className={`icon-button ${node.disabled ? "disabled" : ""}`} 
                        onClick={() => {
                            const x = window.innerWidth / 2
                            const y = window.innerHeight / 2
                            
                            const center = flow.screenToFlowPosition({ x: x, y: y })
                            console.log(center)
                            addNode(
                                {
                                    type, 
                                    id: id, 
                                    position: center, 
                                    data: {id: generateUUID(), title: `${node.tooltip} ${filter(nodes, {type}, ['type'], undefined, eq => eq).length}`, src: ""},
                                },
                                initNodeStatus[type] || "static"
                            )
                        }}
                    >
                        <FontAwesomeIcon key={type} icon={node.icon as IconProp} />
                        <span className="tooltip">{node.tooltip}</span>
                    </button>
                )
            })}
        </div>
    )
}