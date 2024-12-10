// custom imports
import BaseNode from "../base"
import { selector } from "../../state"
import { nodeDataType } from "../../types"
import { Img } from "../../../components/img"
import { useMoodboardStore } from "../../state/store"

// third party
import { useShallow } from "zustand/shallow"

type UploadNodeProps = JSX.IntrinsicElements["div"] & {
    id: string
    data: nodeDataType
}

export const UploadNodeConstructor = (type: "img" | "sketch", sources: string[]) => function UploadNode({id, data: {img, title}, ...props}: UploadNodeProps) {
    const {updateNodeData} = useMoodboardStore(useShallow(selector))

    return (
        <BaseNode 
            {...props}

            id={id}
            type={type}
            title={title}
            sources={sources}
        >
            <Img src={img} onUpload={file => updateNodeData(id, {title, img: file})}/>
        </BaseNode>
    )
}
