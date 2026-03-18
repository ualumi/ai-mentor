import { NavLink } from "react-router-dom";
import Modules from "../modules/Modules";
import Progress from "./Progress";
import "./home.css"
export default function Home () {
    return (
        <section className="home">
            <h1 className="home-label">Hi, username</h1>
            <div className="home-summary">
                    <div className="home-summary-block">
                        <div className="home-summary-block-label">
                            <h3 className="home-summary-block-label-text">Modules</h3>
                            <NavLink to="/module" className={"home-summary-block-label-link"}>перейти</NavLink>
                        </div>
                        <Modules mode="" />
                    </div>
                    
                    <div className="home-summary-block">
                        <div className="home-summary-block-label">
                            <h3 className="home-summary-block-label-text">My progress</h3>
                            <NavLink to="/module" className={"home-summary-block-label-link"}>перейти</NavLink>
                        </div>
                        <Progress labels={["Навык 1", "Навык 2", "Навык 3", "Навык 4"]} values={[20, 40, 30, 80]}></Progress>
                    </div>
                    
                
            </div>
            
        </section>
    )
}