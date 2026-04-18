import { NavLink } from "react-router-dom";
import Modules from "../modules/Modules";
import Progress from "./Progress";
import "./home.css"
import MentorLink from "./MentorLink";
import Heatmap from "./heatmap/Heatmap";
import WeakCases from "./WeakCases";
import {Search} from "lucide-react";
import AttemptsSummary from "./AttemptsSummary";

export default function Home () {
    const user = JSON.parse(localStorage.getItem("user"));
    return (
        <section className="home">
            <div className="home-description">
                <h1 className="home-summary-block-label-text">Привет, {user.username}!</h1>
                {/*<p className="home-summary-block-label-link mentor-link">Позволяет работать с кодом в свободном формате, без привязки к конкретным заданиям.</p>*/}
                {/*<div className="item-home">
                    <Search strokeWidth={1} size={18} />
                    <p className="item-home-text">Search..</p>

                </div>*/}
            </div>
            
            <div className="home-summary">
                    <div>
                        <MentorLink/>
                            <WeakCases/>
                        <div className="home-summary-block ">
                            
                            {/*<div className="home-summary-block-label">
                                <h3 className="home-summary-block-label-text">Modules</h3>
                                <NavLink to="/module" className={"home-summary-block-label-link"}>перейти</NavLink>
                            </div>*/}
                            <Modules mode="" />
                        </div>
                    </div>
                    
                    <div className="home-block">
                        {/*<div className="home-block-education">
                            <div className="home-summary-block home-summary-module-block ">

                                    <p className="home-label module-label">11</p>
                                    <div className="home-summary-block-label-div">
                                        <p className={"home-summary-block-label-link"}>пройдено</p>
                                        <p className={"home-summary-block-label-link"}>модулей</p>
                                    </div>
                                    
                                
                            </div>

                            <div className="home-summary-block home-summary-module-block ">

                                    <p className="home-label module-label">11</p>
                                    <div className="home-summary-block-label-div">
                                        <p className={"home-summary-block-label-link"}>пройдено</p>
                                        <p className={"home-summary-block-label-link"}>модулей</p>
                                    </div>
                                    
                                
                            </div>
                        </div>*/}
                        <AttemptsSummary />
                        
                        
                        <div className="home-summary-block">
                            <div className="home-summary-block-label">
                                <h3 className="home-summary-block-label-text">Навыки</h3>
                                <NavLink to="/module" className={"home-summary-block-label-link"}>перейти</NavLink>
                            </div>
                            <Progress labels={["Навык 1", "Навык 2", "Навык 3", "Навык 4"]} values={[20, 40, 30, 80]}></Progress>
                            {/*<Heatmap token={localStorage.getItem("token")} days={30}/>*/}
                        </div>

                        <div className="home-summary-block">
                            <div className="home-summary-block-label">
                                <h3 className="home-summary-block-label-text">Последняя активность</h3>
                                <NavLink to="/module" className={"home-summary-block-label-link"}>перейти</NavLink>
                            </div>
                            <Heatmap token={localStorage.getItem("token")} days={30}/>

                        </div>
                    </div>
                    
                    
                
            </div>
            
        </section>
    )
}