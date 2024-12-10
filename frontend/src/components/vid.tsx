import { createRef, useState, useEffect } from "react";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type VidProps = JSX.IntrinsicElements["div"] & {
    src?: string 
    placeholder?: string
    vidClassName?: string
    vidStyle?: React.CSSProperties
    vidProps?: JSX.IntrinsicElements["video"]
}

export function Vid({src = "", vidProps, vidClassName, vidStyle, placeholder, className, style, ...props}: VidProps) {
    return (
        <div 
            style={{...style}} 
            className={`img-previewer flex align-center justify-center column pointer ${className || ""}`} 
            
            {...props}
        >
            {src? 
                <video 
                    loop 
                    muted
                    autoPlay 
                    src={src} 
                    {...vidProps}
                    style={{...vidStyle}} 
                    className={`img ${vidClassName}`}
                /> 
                : 
                <>{placeholder && <p className="placeholder">{placeholder}</p>}</>
            }
        </div>
    )
}