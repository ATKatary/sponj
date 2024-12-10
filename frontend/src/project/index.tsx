// custom imports
import { selector } from "./state";
import { mbType } from "../mb/types";
import { createMoodboard } from "../mb/api";
import { navStateType } from "../nav/types";
import { useProjectStore } from "./state/store";
import MoodboardThumbnail from "../mb/thumbnail";

// third party
import { useEffect } from "react";
import { useShallow } from "zustand/shallow";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import "../assets/css/project.css"; 

type ProjectProps = JSX.IntrinsicElements["section"] & {
}

export default function Project({id, ...props}: ProjectProps) {
    const params = useParams()
    const navigator = useNavigate()
    const project = useProjectStore(useShallow(selector))

    useEffect(() => {project.init(id!)}, [])
    
    const uid = params.uid
    const state = useLocation().state as navStateType
    
    return (
        <section className="flex align-center flex-wrap">
            {project?.mbs?.map((mb, i) => {
                return (
                    <MoodboardThumbnail 
                        key={mb.id}
                        mb={mb as mbType} 
                        to={`/${uid}/mb/${mb.id}`} 
                        className="mb-filled-secondary"
                        state={{id: mb.id, title: mb.title, prevState: state}}
                    >
                        <h3 style={{fontWeight: 550, margin: "0 0 10px 10px"}}>{mb.title}</h3>
                    </MoodboardThumbnail>
                )
            })}

            <MoodboardThumbnail 
                onAdd={async () => {
                    if (!id) return
                    const mb = await createMoodboard(id)
                    if (!mb) return

                    const href = `/${uid}/mb/${mb.id}`
                    navigator(href, {state: {id: mb.id, title: mb.title, prevState: state, href: href}})
                }}

                to={""}
                disabled
                className="mb-thumbnail dashed"
            />
        </section>
    )
}