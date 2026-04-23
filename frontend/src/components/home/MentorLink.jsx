import { NavLink } from "react-router-dom";

export default function MentorLink () {
    return (
        <div className="mentorblock">
            <div className="mentorblock-info">
                <p className="home-summary-block-label-text">Самостоятельная практика с ИИ-ментором</p>
                <p className="home-summary-block-label-link mentor-link">Позволяет работать с кодом в свободном формате, <br></br>без привязки к конкретным заданиям.</p>
                <button className="module-button mentor-button">
                    <NavLink className={"mintor-link"} to={"/mentor"}>
                    Перейти
                    </NavLink>
                </button>
            </div>
            
            
        </div>
    )
}