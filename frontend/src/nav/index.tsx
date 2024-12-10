// custom imports
import { Nav, NavItem } from "./utils";
import { navStateType } from "./types";

// third party
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// css sheets
import '../assets/css/nav.css'
import '../assets/css/vars/_nav.css';

type DefaultNavProps = JSX.IntrinsicElements["nav"] & {
    data: navStateType[]
}

export default function DefaultNav({data, ...props}: DefaultNavProps) {

    return (
        <Nav {...props}>
            <header>
                <div className="icon-small"></div>
                <h3>Ahmed Katary</h3>
                {data.length == 0 && props.children}
            </header>
            {data.length > 0 && 
                <section id="nav-content">
                    {data.map(({id, icon, ...nav}) => 
                        <NavItem 
                            key={id}
                            icon={icon}
                            state={{id: id, ...nav}}
                            style={{width: 150, padding: "10px 20px"}}
                        >
                            {nav.title}
                        </NavItem>
                    )}
                    {props.children}
                </section>
            }
            {/* <section id="nav-promo" className="flex align-center justify-center">
                <div className="promo-container">
                    <FontAwesomeIcon icon={"fa-solid fa-circle-up" as IconProp}/>
                    <p>Ready to go beyond this free plan? Upgrade for premium features.</p>
                    <button>View plans</button>
                </div>
            </section> */}
            <footer id="nav-footer"></footer>
        </Nav>
    )
}