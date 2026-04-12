

{/*import {
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
    <div className="modules-container progress-container">
      <Bar data={chartData} options={options} />
    </div>
  );
}*/}

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useProgress } from "../../hooks/useProgress";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

// 🔥 ПЛАГИН ДЛЯ ЛЕЙБЛОВ
{/*const labelsPlugin = {
  id: "customLabels",
  afterDatasetsDraw(chart) {
    const { ctx, data, scales } = chart;

    ctx.save();
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#aaa";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    data.datasets[0].data.forEach((value, index) => {
      const y = scales.y.getPixelForValue(index);

      const label = data.labels[index];

      // 🔥 позиция текста слева от бара
      ctx.fillText(label, 8, y);
    });

    ctx.restore();
  },
};

export default function ProgressChart() {
  const { data, isLoading, error } = useProgress();

  if (isLoading) return <div className='item'>Loading...</div>;
  if (error) return <div className='item'>Здесь будет Ваш прогресс на платформе</div>;

  const progress = data?.progress || {};

  const labels = Object.keys(progress);
  const values = Object.values(progress).map((item) => item.ema);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: "#3B68FF",
        borderRadius: 8,
        borderSkipped: false,
        categoryPercentage: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    indexAxis: "y",

    plugins: {
      legend: { display: false },
    },

    layout: {
      padding: {
        left: 120, // 🔥 ОТСТУП ПОД ТЕКСТ
      },
    },

    scales: {
      x: {
        display: false,
        beginAtZero: true,
        max: 1,
      },
      y: {
        display: false, // 🔥 УБРАЛИ ОСЬ
      },
    },
  };

  return (
    <div className="modules-container progress-container">
      <Bar data={chartData} options={options} plugins={[labelsPlugin]} />
    </div>
  );
}*/}

export default function ProgressChart() {
  const { data, isLoading, error } = useProgress();

  if (isLoading) return <div className='item'>Loading...</div>;
  if (error) return <div className='item'>Здесь будет Ваш прогресс на платформе</div>;

  const progress = data?.progress || {};

  const labels = Object.keys(progress);
  const values = Object.values(progress).map((item) => item.ema);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: "#3B68FF",
        borderRadius: 8,
        borderSkipped: false,

        // 🔥 плотнее столбцы
        categoryPercentage: 0.3,
        barPercentage: 0.6,
        // или можно вместо них:
        // barThickness: 14
      },
    ],
  };

  const options = {
    responsive: true,
    indexAxis: "y",

    plugins: {
      legend: { display: false },
    },

    layout: {
      padding: {
        left: 0,
      },
    },

    scales: {
      x: {
        display: false,
        beginAtZero: true,
        max: 1,
      },

      y: {
        display: true,       // 🔥 включаем
        position: "right",   // 🔥 переносим вправо

        grid: {
          display: false,    // чтобы не было линий
        },

        ticks: {
          display: false,    // если не хочешь подписи оси
        },
      },
    },
  };

  return (
    <div className="modules-container progress-container">
      <Bar data={chartData} options={options} />
    </div>
  );
}


{/*import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useProgress } from "../../hooks/useProgress";

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

        // 🔥 СКРУГЛЕНИЕ
        borderRadius: 8,
        borderSkipped: false,
        //barThickness: 12, // чтобы скруглялось с обеих сторон
        categoryPercentage: 0.6
      },
    ],
  };

  const options = {
    responsive: true,
    indexAxis: "y", // 🔥 ГОРИЗОНТАЛЬНЫЙ ГРАФИК

    plugins: {
      legend: {
        display: false,
      },
    },

    scales: {
      x: {
        beginAtZero: true,
        max: 1,
      },
      y: {
        display: true, // теперь это ось категорий
      },
    },
  };

  return (
    <div className="modules-container progress-container">
      <Bar data={chartData} options={options} />
    </div>
  );
}*/}
