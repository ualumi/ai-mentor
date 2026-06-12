import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useProgress } from "../../hooks/useProgress";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Progress() {
  const { data, isLoading, error } = useProgress();

  if (isLoading) return <div className="item">Loading...</div>;
  if (error) {
    return (
      <div className="item">
        Здесь будет Ваш прогресс на платформе
      </div>
    );
  }

  const skills = extractSkillProgress(data);
  const rows = Object.entries(skills)
    .map(([name, state]) => ({
      label: formatSkillName(name),
      value: progressValue(state),
    }))
    .filter((row) => Number.isFinite(row.value))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  if (!rows.length) {
    return (
      <div className="modules-container progress-container">
        <div className="item">Здесь будет Ваш прогресс на платформе</div>
      </div>
    );
  }

  const chartData = {
    labels: rows.map((row) => row.label),
    datasets: [
      {
        data: rows.map((row) => row.value),
        backgroundColor: "linear-gradient(90deg, #3b68ff, #6f90ff)",
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 10,
        maxBarThickness: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${Math.round(context.raw * 100)}%`,
        },
      },
    },
    scales: {
      x: {
        display: false,
        beginAtZero: true,
        max: 1,
      },
      y: {
        display: true,
        position: "right",
        grid: { display: false },
        ticks: {
          display: true,
          padding: 8,
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

function extractSkillProgress(data) {
  const progress = data?.progress ?? data ?? {};

  if (progress.skills && typeof progress.skills === "object") {
    return progress.skills;
  }

  if (data?.skills && typeof data.skills === "object") {
    return data.skills;
  }

  return Object.fromEntries(
    Object.entries(progress).filter(([, value]) => isSkillState(value))
  );
}

function progressValue(state) {
  if (typeof state === "number") return normalizeProgressNumber(state);
  if (!state || typeof state !== "object") return Number.NaN;

  return firstFiniteNumber(
    state.bkt_mastery,
    state.mastery,
    state.ema_mastery,
    state.ema,
    state.progress
  );
}

function normalizeProgressNumber(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return Number.NaN;
  return numeric > 1 ? numeric / 100 : numeric;
}

function firstFiniteNumber(...values) {
  for (const value of values) {
    const numeric = normalizeProgressNumber(value);
    if (Number.isFinite(numeric)) return Math.min(1, Math.max(0, numeric));
  }

  return Number.NaN;
}

function isSkillState(value) {
  if (typeof value === "number") return true;
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  return [
    "bkt_mastery",
    "mastery",
    "ema_mastery",
    "ema",
    "progress",
  ].some((key) => Number.isFinite(Number(value[key])));
}

function formatSkillName(name) {
  return String(name || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
