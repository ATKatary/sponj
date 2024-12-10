// custom imports
import { mbType } from "./types";

// third party
import { Link, LinkProps } from "react-router-dom";

type MoodboardThumbnailProps = (LinkProps |  JSX.IntrinsicElements["div"]) & {
    mb?: mbType
    disabled?: boolean
    onAdd?: () => void
}

export default function MoodboardThumbnail({mb, onAdd, disabled, className, ...props}: MoodboardThumbnailProps) {
    return (
        disabled ? 
            <div 
                className={`mb-thumbnail ${className}`} 
                {...props as JSX.IntrinsicElements["div"]}
            >
                <Content {...props} mb={mb} onAdd={onAdd}/>
            </div>
            :
            <Link 
                {...props as LinkProps}
                className={`mb-thumbnail ${className}`} 
            >
                <Content {...props} mb={mb} onAdd={onAdd} />
            </Link>
    )
}

function Content({mb, onAdd, children}: MoodboardThumbnailProps) {
    return (
        <>
            {onAdd && <button onClick={onAdd}>+</button>}
            {children}
        </>
    )
}