// custom imports
import { CheckTyping } from "./txt";

// third party
import { useState } from "react";

// css stylesheets
import "../assets/css/editable.css";

type EditableProps = JSX.IntrinsicElements["input"] & {
    value: string
    onTypingStopped?: (header: string) => void
}

export function Editable({value, onTypingStopped, ...props}: EditableProps) {
    const [header, setHeader] = useState<string>(value)
    const { onUpdate } = CheckTyping(1000, () => onTypingStopped && onTypingStopped(header))
    
    return (
        <input 
            {...props}
            value={header}
            onChange={event => {
                onUpdate(() => setHeader(event.target.value))
            }}
        />
    )
}

export function EditableH3({className, style, ...props}: EditableProps) {
    return (
        <Editable 
            {...props}
            className={`editable ${className}`}
            style={{fontWeight: 550, margin: "10px 0 0 10px", ...style}}
        />
    )
}

export function EditableH1({className, style, ...props}: EditableProps) {
    return (
        <Editable 
            {...props}
            style={{...style}}
            className={`editable-h1 editable ${className}`}
        />
    )
}