// custom imports
import DefaultNav from "./nav";
import Project from "./project";
import { selector } from "./user/state";
import { NavCrumbs } from "./nav/utils";
import Projects from "./components/projects";
import { useUserStore } from "./user/state/store";

// static data
import navData from './assets/data/nav.json';

// third party
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// css stylesheets
import './assets/css/home.css';
import { useShallow } from "zustand/shallow";

type HomeProps = JSX.IntrinsicElements["div"] & {
    projects?: boolean
}

export default function Home({projects, ...props}: HomeProps) {
    const params = useParams()
    const user = useUserStore(useShallow(selector))
    
    useEffect(() => {user.init(params.uid || "akatary")}, [])

    return (
        <>
            <DefaultNav data={navData.home}/>

            <div id="home-content">
                <NavCrumbs />
                <section>{/* actions */}</section>

                {projects && <Projects projects={user.projects}/>}
                {params.projectId && <Project id={params.projectId}/>}
            </div>
        </>
    )
}
