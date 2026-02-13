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
  const options = {
    plugins: {
      chartAreaBackground: {
        color: "#1C1D25",
        borderRadius: 16
      },
      legend: {
        display: false, // ⭐
      },
    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: "Прогресс обучения",
        data: values,
        borderColor: "#3B68FF",
        backgroundColor: "rgba(79,70,229,0.2)",
        tension: 0.3,
      },
    ],
  };
  return (
    <div className="analitycs">
      <Line data={data} options={options} width={600} height={260} />
    </div>
  );
}