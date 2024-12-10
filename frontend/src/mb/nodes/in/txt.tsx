// custom imports
import BaseNode from "../base";
import { selector } from "../../state";
import Txt from "../../../components/txt";
import { nodeDataType } from "../../types";
import { useMoodboardStore } from "../../state/store";

// third party
import { useState } from "react";
import { useShallow } from "zustand/shallow";

type TxtNodeProps = JSX.IntrinsicElements["div"] & {
    id: string
    data: nodeDataType
}

export default function TxtNode({id, data: {src, title}, ...props}: TxtNodeProps) {
    const {updateNodeData} = useMoodboardStore(useShallow(selector))
    const [text, setText] = useState(src);
    
    return (
        <BaseNode 
            {...props}

            id={id}
            type="txt"
            title={title}
            sources={["txt"]}
            style={{width: 200}}
        >
            <Txt 
                text={text || ""}
                defaultValue={src}
                onChange={event => {
                    event.preventDefault()
                    event.stopPropagation()
                    setText(event.target.value)
                }}
                onTypingStopped={() => updateNodeData(id, {title, src: text})}
                placeholder="Write your prompt here..."
            />
        </BaseNode>
    )
}