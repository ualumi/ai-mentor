import { NavLink } from "react-router-dom";
import Modules from "../modules/Modules";
import Progress from "./Progress";
import "./home.css"
import MentorLink from "./MentorLink";
import Heatmap from "./heatmap/Heatmap";
import WeakCases from "./WeakCases";

export default function Home () {
    const user = JSON.parse(localStorage.getItem("user"));
    return (
        <section className="home">
            <h1 className="home-label">Привет, {user.username}!</h1>
            {/*<p className="home-summary-block-label-link mentor-link">Позволяет работать с кодом в свободном формате, без привязки к конкретным заданиям.</p>*/}
            <MentorLink/>
            <WeakCases/>
            <div className="home-summary">
                    <div className="home-summary-block ">
                        {/*<div className="home-summary-block-label">
                            <h3 className="home-summary-block-label-text">Modules</h3>
                            <NavLink to="/module" className={"home-summary-block-label-link"}>перейти</NavLink>
                        </div>*/}
                        <Modules mode="" />
                    </div>
                    
                    <div className="home-summary-block">
                        <div className="home-summary-block-label">
                            <h3 className="home-summary-block-label-text">Прогресс на платформе</h3>
                            <NavLink to="/module" className={"home-summary-block-label-link"}>перейти</NavLink>
                        </div>
                        <Progress labels={["Навык 1", "Навык 2", "Навык 3", "Навык 4"]} values={[20, 40, 30, 80]}></Progress>
                        {/*<Heatmap token={localStorage.getItem("token")} days={30}/>*/}
                    </div>
                    
                
            </div>
            
        </section>
    )
}