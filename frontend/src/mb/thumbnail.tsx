// custom imports
import { mbType } from "./types";

// third party
import { Link, LinkProps } from "react-router-dom";

type MoodboardThumbnailProps = (LinkProps |  JSX.IntrinsicElements["div"]) & {
    mb?: mbType
    disabled?: boolean
    onAdd?: () => void

    contClassName?: string
}

export default function MoodboardThumbnail({mb, onAdd, disabled, className, contClassName, children, ...props}: MoodboardThumbnailProps) {
    return (
        disabled ? 
            <div 
                className={`mb-thumbnail ${className}`} 
                {...props as JSX.IntrinsicElements["div"]}
            >
                {children}
                <Content {...props} mb={mb} onAdd={onAdd}/>
            </div>
            :
            <div className={`mb-thumbnail flex column ${contClassName}`}>
                {children}
                <Link 
                    {...props as LinkProps}
                    className={`width-100 height-100 ${className}`} 
                >
                    <Content {...props} mb={mb} onAdd={onAdd} />
                </Link>
            </div>
    )
}

function Content({onAdd}: MoodboardThumbnailProps) {
    return (
        <>
            {onAdd && <button onClick={onAdd} className="mb-btn-add">+</button>}
        </>
    )
}