// custom imports
import DefaultNav from "../nav";
import Project from "../project";
import { NavCrumbs } from "../nav/utils";
import Projects from "../components/projects";
import { useHomeStore } from "./state/store";
import { useUserStore } from "../user/state/store";
import { selector as homeSelector } from "./state";
import { selector as userSelector } from "../user/state";

// static data
import navData from '../assets/data/nav.json';

// third party
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// css stylesheets
import '../assets/css/home.css';
import { useShallow } from "zustand/shallow";
import { LoadingBar } from "../components/loading";

type HomeProps = JSX.IntrinsicElements["div"] & {
    projects?: boolean
}

export default function Home({projects, ...props}: HomeProps) {
    const params = useParams()
    const user = useUserStore(useShallow(userSelector))
    const { loading, setLoading } = useHomeStore(useShallow(homeSelector))

    const initialize = async () => {
        setLoading({on: true, progressText: "Initializing..."})
        await user.init(params.uid!)
        setLoading({on: false, progressText: ""})
    }
    
    useEffect(() => {
        if (!params.uid) return
        initialize()
    }, [])

    return (
        <>
            <DefaultNav user={user} data={navData.home}/>

            <div id="home-content">
                {/* <p className="saving">{global.saving? "Saving..." : ""}</p> */}
                {loading.on && <LoadingBar progressText={loading.progressText} style={{top: "var(--nav-top)"}}/>}
                <NavCrumbs />
                <section>{/* actions */}</section>

                {projects && 
                    <>
                        <h1 className="cursor-default">All Projects</h1>
                        <Projects projects={user.projects}/>
                    </>
                }
                {params.projectId && <Project id={params.projectId}/>}
            </div>
        </>
    )
}
