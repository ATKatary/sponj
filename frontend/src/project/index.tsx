// custom imports
import { selector } from "./state";
import { mbType } from "../mb/types";
import { editProject } from "./api";
import { navStateType } from "../nav/types";
import { useProjectStore } from "./state/store";
import MoodboardThumbnail from "../mb/thumbnail";
import { createMoodboard, editMoodboard } from "../mb/api";
import { EditableH1, EditableH3 } from "../components/editable";

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
    const { mbs, title, init } = useProjectStore(useShallow(selector))

    useEffect(() => {init(id!)}, [])
    
    const uid = params.uid
    const state = useLocation().state as navStateType

    return (
        <div>
            {title &&
                <EditableH1 
                    value={title}
                    onTypingStopped={(header) => {
                        if (id) {
                            editProject(id, header)
                        }
                    }}
                />
            }
            <section className="flex align-center flex-wrap">
                {mbs?.map((mb, i) => {
                    return (
                        <MoodboardThumbnail 
                            key={mb.id}
                            mb={mb as mbType} 
                            to={`/${uid}/mb/${mb.id}`} 
                            contClassName="mb-filled-secondary"
                            state={{id: mb.id, title: mb.title, prevState: state}}
                        >
                            <EditableH3 
                                value={mb.title}
                                onTypingStopped={(header) => {
                                editMoodboard(mb.id, header) 
                                }}
                            />
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
                    contClassName="mb-thumbnail dashed"
                />
            </section>
        </div>
    )
}