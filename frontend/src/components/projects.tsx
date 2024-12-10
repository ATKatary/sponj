// custom imports
import { navStateType } from "../nav/types"
import { projectType } from "../project/types"
import { createProject } from "../project/api"
import { ProjectThumbnail } from "../project/thumbnail"

// third party
import { useLocation, useNavigate, useParams } from "react-router-dom"

type ProjectsProps = JSX.IntrinsicElements["section"] & {
    projects?: projectType[]
}

export default function Projects({projects, ...props}: ProjectsProps) {
    const params = useParams()
    const navigator = useNavigate()
    const state = useLocation().state as navStateType
    
    const uid = params.uid

    return (
        <section className="flex align-center flex-wrap">
            {projects?.map((project) => {
                const href = `/${uid}/project/${project.id}`

                return (
                    <ProjectThumbnail 
                        key={project.id} 
                        project={project as projectType}
                        
                        to={href}
                        state={{
                            href: href, 
                            id: project.id, 
                            prevState: state,
                            title: project.title, 
                        }}
                    >
                        <h3 style={{fontWeight: 550, margin: "10px 0 0 10px"}}>{project.title}</h3>
                        <p style={{margin: "10px 0 0 10px"}}>{project.mbs.length} mood boards · Updated 1 min ago</p>
                    </ProjectThumbnail>
                )
            })}

            <ProjectThumbnail 
                onAdd={async () => {
                    if (!uid) return
                    const project = await createProject(uid)

                    const href = `/${uid}/project/${project.id}`
                    navigator(href, {state: {id: project.id, title: project.title, prevState: state, href: href}})
                }}
                
                to={""}
                mbClassName="mb-filled" 
                style={{backgroundColor: "var(--bg-secondary)"}}
            >
                <h3 style={{fontWeight: 550, margin: "10px 0 0 10px"}}>Let's create a project!</h3>
                <p style={{margin: "10px 0 0 10px"}}>Get unlimited everything on professional plan</p>
            </ProjectThumbnail>
        </section>
    )
}