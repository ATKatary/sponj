// custom imports
import XCanvas from "./canvas";
import DefaultNav from "../nav";
import { selector } from "./state";
import { getPlayground } from "./api";
import { useCustomState } from "../utils";
import ModeControls from "./controls/mode";
import { navStateType } from "../nav/types";
import { PlaygroundToolbar } from "./toolbar";
import { usePlaygroundStore } from "./state/store";
import { LoadingBar } from "../components/loading";
import { MeshControls } from "./controls/meshControls";

// static data
import navData from "../assets/data/nav.json";

// third party
import { useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useShallow } from "zustand/shallow";

// css stylesheets
import '../assets/css/playground.css';
import { PlaygroundPanel } from "./panel";

type PlaygroundProps = JSX.IntrinsicElements["div"] & {
}

export default function Playground(props: PlaygroundProps) {
    const params = useParams()
    const {
        id, 
        mode,
        // tool,
        title,
        meshes, 
        loading,
        selected,

        init,

        addMesh, 
        deleteMesh,

        setLoading,

        ...playground
    } = usePlaygroundStore(useShallow(selector))
    const [activeNav, setActiveNav] = useCustomState<navStateType>(navData.playground[0] as navStateType);
    
    const uid = params.uid
    const plid = params.plid
    const socket = useRef<WebSocket>()

    const initialzie = async () => {
        if (plid) {
            deleteMesh()
            setLoading({on: true, progressText: "Initializing..."})
            const meshes = (await getPlayground(plid)).meshes
            meshes.forEach(mesh => addMesh(mesh))
            setLoading({on: false, progressText: ""})
        }
    }

    useEffect(() => { 
        initialzie()
        const sock = new WebSocket(`ws://localhost:8000/ws/user/${uid}`)
        sock.onmessage = (event) => {
            const {type, mid, data} = JSON.parse(event.data)
            switch (type) {
                case "meshUpdate":
                    setLoading({on: true, progressText: "Re-initializing..."})
                    deleteMesh(mid)
                    addMesh(data)
                    setLoading({on: false, progressText: ""})
                    break
                default:
                    console.log(`[onmessage] >> got message of type ${type}`)
                    break
            }
        }

        socket.current = sock
    }, [])

    // all control editing needs to be handled here and it will not know about the changes in the canvas, but that is fine it does not need to. 
    
    return (
        <div id="canvas-container" className='height-100'>
            <XCanvas meshes={meshes} mode={mode}><></></XCanvas>

            {/* Playground Nav */}
            <DefaultNav data={[]} style={{zIndex: 1, right: 'var(--nav-left)', left: "auto"}}>
                <button 
                    className="mb-save-btn"
                    onClick={async () => {}}
                >
                    Share
                </button>
            </DefaultNav>   
            
            <ModeControls/>
            <PlaygroundPanel />
            {loading.on && <LoadingBar progressText={loading.progressText} />}

            {selected && <MeshControls />}
            <PlaygroundToolbar />
        </div>
    )
}