// custom imports
import DefaultNav from "../nav"
import { selector } from "./state"
import { nodeTypes } from "./nodes"
import { img2Base64 } from "../utils"
import { MoodboardToolbar } from "./toolbar"
import { useMoodboardStore } from "./state/store"
import { editMoodboard, getMoodboard } from "./api"

// static data
import navData from '../assets/data/nav.json'

// third party
import { useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import { useShallow } from "zustand/shallow"
import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow, ReactFlowProvider } from "@xyflow/react"

// css sheets
import "../assets/css/mb.css"

type MoodboardProps = JSX.IntrinsicElements["div"] & {
}

const proOptions = { hideAttribution: true } 

export default function Moodboard({...props}: MoodboardProps) {
    const {
        id,
        title, 
        nodes,
        edges,
        
        init, 
        initNodeData,

        nodeStatus,
        setNodeStatus,

        addedNodes, 
        deletedNodes, 
        getUpdatedNodes,
        
        addedEdges, 
        deletedEdges, 
        
        active, 
        setActive, 
        
        addNode,
        updateNodeData,

        getPath,
        isValidPath,
        
        save,
        ...flowProps
    } =  useMoodboardStore(useShallow(selector)) as any

    const params = useParams()

    const uid = params.uid
    const mbId = params.mbId
    const socket = useRef<WebSocket>()
    
    const initialzie = async () => {
        if (mbId) {
            init(await getMoodboard(mbId))
        }
    }

    useEffect(() => {
        initialzie()
        const sock = new WebSocket(`ws://localhost:8000/ws/user/${uid}`)
        sock.onmessage = async (event) => {
            const {type, nid, status, data} = JSON.parse(event.data)
            switch (type) {
                case "nodeUpdate":
                    console.log(`[onmessage] >> got message for ${nid} [${status}] (data)`, data)
                    if (nid && status) {
                        setNodeStatus(nid, status)
                        if (data) updateNodeData(nid, data)
                    }
                    break
                default:
                    console.log(`[onmessage] >> got message of type ${type}`)
                    break
            }
        }

        socket.current = sock
        setInterval(() => {
            if (socket.current?.readyState === 1) socket.current.send(JSON.stringify({"signal": "heartbeat"}))
        }, 10000)
    }, [])

    return (
        <ReactFlowProvider>
            <div {...props} className="height-100 width-100">
                <DefaultNav data={[]} style={{zIndex: 1, right: 'var(--nav-left)', left: "auto"}}>
                    <button 
                        className="mb-save-btn"
                        onClick={async () => {}}
                    >
                        Share
                    </button>
                </DefaultNav>
                <ReactFlow
                    fitView
                    nodes={nodes}
                    edges={edges}
                    {...flowProps}
                    minZoom={0.001}
                    nodeTypes={nodeTypes}
                    proOptions={proOptions}
                    onClick={(event) => {
                        if ((event.target as any).getAttribute("class")?.startsWith("react-flow__pane")) {
                            setActive("")
                        }
                    }}
                    selectNodesOnDrag={false}
                    className="validationflow"
                >
                    <MiniMap position="top-left"/>
                    <Controls position="bottom-right"/>
                    <Background variant={BackgroundVariant.Dots} />
                </ReactFlow>
            
                <MoodboardToolbar />
            </div>
        </ReactFlowProvider>
    )
}
