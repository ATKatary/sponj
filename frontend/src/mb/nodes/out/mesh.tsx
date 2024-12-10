// custom imports
import BaseNode from "../base"
import { Vid } from "../../../components/vid"
import { Img } from "../../../components/img"

// third party
import { nodeDataType } from "../../types"
import { useNavigate } from "react-router-dom"

type MeshNodeProps = JSX.IntrinsicElements["div"] & {
    id: string
    data: nodeDataType
}

export default function MeshNode({id, data: {title, src, playground}, ...props}: MeshNodeProps) {
    const hasData = playground? true : false
    const navigate = useNavigate()

    return (
        <BaseNode 
            {...props}

            id={id}
            type="mesh"
            title={title}
            hasData={hasData}
            sources={["mesh"]}
            className="mesh out"
            targets={["style", "geometry"]}
            // style={{height: hasData? 175 : 120, width: 175}}
        >
            <a href={playground? `/akatary/playground/${playground.id}` : "#"} target="_blank">
                <Img 
                    disabled 
                    src={playground?.meshes[0].gif} 
                    placeholder="Generated mesh will appear here" style={{textAlign: "center"}}
                />
            </a>
        </BaseNode>
    )
}