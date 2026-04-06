import Progress from "./Progress"
import Heatmap from "./heatmap/Heatmap";
function ProgressPage ({ }) {
  return (
    <div className="home">
        <h1 className="home-label">Прогресс на платформе</h1>
        <div className="progress-content">
            <Progress />
            <Heatmap token={localStorage.getItem("token")} days={30}/>
        </div>
        
    </div>
  );
};

export default ProgressPage;