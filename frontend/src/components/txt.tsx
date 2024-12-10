import { useEffect, useRef, useState } from "react";

type TxtProps = JSX.IntrinsicElements["textarea"] & {
    text: string
    onTypingStopped?: () => void
}

export default function Txt({text, children, onTypingStopped, onKeyUp, ...props}: TxtProps) {
    const typing = useRef(false)
    const [rows, setRows] = useState(1)
    const timer = useRef<NodeJS.Timeout>()

    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "0";
            const scrollHeight = textAreaRef.current.scrollHeight;
            textAreaRef.current.style.height = `${scrollHeight - 15}px`;
        }
    }, [textAreaRef, text])

    const checkTyping = () => {
        if (typing.current) {
            typing.current = false

            if (timer.current) clearInterval(timer.current)
            timer.current = setTimeout(checkTyping, 1000)
        } else {
            onTypingStopped && onTypingStopped()
        }
    }

    return (
        <textarea 
            {...props}
            ref={textAreaRef}
            onKeyUp={event => {
                if (event.code === "Enter") {
                    setRows(rows + 1)
                }

                typing.current = true
                if (timer.current) clearInterval(timer.current)

                onKeyUp && onKeyUp(event)
                timer.current = setTimeout(checkTyping, 1000)
            }}
    >{children}</textarea>
    )
}