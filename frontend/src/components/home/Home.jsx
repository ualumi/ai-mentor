import Modules from "../modules/Modules";
import Progress from "./Progress";
import "./home.css"
export default function Home () {
    return (
        <section className="home">
            <Modules mode="modules" />
            <Progress labels={["Навык 1", "Навык 2", "Навык 3", "Навык 4"]} values={[20, 40, 30, 80]}></Progress>
        </section>
    )
}