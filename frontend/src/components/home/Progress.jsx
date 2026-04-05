/*export default function Progress () {
    return (
        <section>
            
        </section>
    )
}*/

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useProgress } from "../../hooks/useProgress"; // ← твой хук

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function ProgressChart() {
  const { data, isLoading, error } = useProgress();

  // -------------------------
  // Loading / Error
  // -------------------------
  if (isLoading) return <div className='item'>Loading...</div>;
  if (error) return <div className='item'>Здесь будет Ваш прогресс на платформе</div>;

  // -------------------------
  // Transform data
  // -------------------------
  const progress = data?.progress || {};

  const labels = Object.keys(progress);

  const values = Object.values(progress).map((item) => item.ema);

  // -------------------------
  // Chart config
  // -------------------------
  const chartData = {
    labels,
    datasets: [
      {
        label: "Освоение компетенций",
        data: values,
        backgroundColor: "#3B68FF",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        display:false,
        beginAtZero: true,
        max: 1,
      },
    },
  };

  return (
    <div className="modules-container">
      <Bar data={chartData} options={options} />
    </div>
  );
}

{/*import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function Progress({ labels, values }) {
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
    <div className="modules-container">
      <Line data={data} options={options} width={450} height={260} />
    </div>
  );
}*/}