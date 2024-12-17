// custom imports
import DefaultNav from "../nav"
import { update } from "../utils"
import { nodeType } from "./types"
import { nodeTypes } from "./nodes"
import { getMoodboard } from "./api"
import { updateMoodboard } from "./utils"
import { MoodboardToolbar } from "./toolbar"
import { LoadingBar } from "../components/loading"

import { selector as mbSelector } from "./state"
import { useMoodboardStore } from "./state/store"

import { useUserStore } from "../user/state/store"
import { selector as userSelector } from "../user/state"

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

        loading,
        setLoading,
        
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
    } =  useMoodboardStore(useShallow(mbSelector))

    const params = useParams()
    const user = useUserStore(useShallow(userSelector))
    
    const uid = params.uid
    const mbId = params.mbId
    const socket = useRef<WebSocket>()
    
    const initialzie = async () => {
        if (uid && mbId) {
            setLoading({on: true, progressText: "initializing..."})
            user.init(uid)
            init(await getMoodboard(mbId))
            setLoading({on: false, progressText: ""})
        }
    }

    useEffect(() => {
        initialzie()
        const sock = new WebSocket(`ws://45.33.17.11:8001/ws/user/${uid}`)
        sock.onmessage = async (event) => {
            const {type, nid, status, data} = JSON.parse(event.data)
            switch (type) {
                case "nodeUpdate":
                    console.log(`[onmessage] >> got message for ${nid} [${status}] (data)`, data)
                    if (nid && status) {
                        setNodeStatus(nid, status)
                        if (data) updateNodeData(nid, data)
                        
                        updateMoodboard(mbId!, (mb) => ({
                            ...mb,
                            nodes: update<nodeType>(mb.nodes, {id: nid}, ['id'], {status, data})
                        }))
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
                {loading.on && <LoadingBar progressText={loading.progressText} style={{top: "var(--nav-top)"}}/>}
                <DefaultNav 
                    user={user} 
                    style={{zIndex: 1, right: 'var(--nav-left)', left: "auto"}}
                >
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
                    panOnScroll
                    selectionOnDrag
                    panOnDrag={[1, 2]}
                    nodeTypes={nodeTypes}
                    proOptions={proOptions}
                    onClick={(event) => {
                        if ((event.target as any).getAttribute("class")?.startsWith("react-flow__pane")) {
                            setActive("")
                        }
                    }}
                    selectNodesOnDrag
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
