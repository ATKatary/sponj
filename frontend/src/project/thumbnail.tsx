// custom imports
import { projectType } from "./types";
import { navStateType } from "../nav/types";
import MoodboardThumbnail from "../mb/thumbnail";

// third party
import { Link, LinkProps } from "react-router-dom";

type ProjectThumbnailProps = LinkProps & {
    onAdd?: () => void
    mbClassName?: string
    state?: navStateType
    project?: projectType
    mbStyle?: React.CSSProperties
}

export function ProjectThumbnail({project, className, mbStyle, mbClassName, onAdd, ...props}: ProjectThumbnailProps) {
    return (
        <Link className={`project-thumbnail ${className}`} {...props}>
            <div className="project-thumbnail-mbs">
                {Array(4).fill(0).map((_, i) => {
                    return (
                        <MoodboardThumbnail 
                            key={i}
                            to={`#`}
                            disabled
                            className={`${mbClassName}`}
                            style={{...mbStyle, width: "50%", height: "calc(50% - 25px)"}}
                        />
                    )
                })}

                {onAdd && <button onClick={onAdd}>+</button>}
            </div>

            {props.children}
        </Link>
    )
}