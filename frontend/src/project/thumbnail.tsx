// custom imports
import { projectType } from "./types";
import { navStateType } from "../nav/types";
import MoodboardThumbnail from "../mb/thumbnail";

// third party
import { useRef } from "react";
import { Link, LinkProps } from "react-router-dom";

// static data 
import contextMenuData from '../assets/data/context.json';

type ProjectThumbnailProps = LinkProps & {
    onAdd?: () => void
    state?: navStateType
    project?: projectType

    mbClassName?: string
    mbStyle?: React.CSSProperties

    contClassName?: string
    contStyle?: React.CSSProperties
}

export function ProjectThumbnail({project, className, mbStyle, mbClassName, onAdd, contStyle, contClassName, ...props}: ProjectThumbnailProps) {
    return (
        <div 
            style={{...contStyle}}
            className={`project-thumbnail ${contClassName}`} 
        >
            <Link className={`${className}`} {...props}>
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
            </Link>
            {props.children}
        </div>
    )
}