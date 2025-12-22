import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import '../App.css'

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function Analitycs({ labels, values }) {
  const data = {
    labels,
    datasets: [
      {
        label: "Прогресс обучения",
        data: values,
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79,70,229,0.2)",
        tension: 0.3,
      },
    ],
  };
  return (
    <div className="analitycs">
      <Line data={data} />
    </div>
  );
}