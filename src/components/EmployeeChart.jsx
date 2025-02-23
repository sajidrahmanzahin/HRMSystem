// src/components/EmployeeChart.jsx
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import React, { useEffect, useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const EmployeeChart = ({ filter }) => {
  const [data, setData] = useState({
    employee: {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      datasets: [
        {
          label: "Total Employees",
          data: [
            1000, 1020, 1050, 1070, 1100, 1120, 1150, 1180, 1200, 1220, 1230,
            1234,
          ],
          borderColor: "var(--primary-blue)",
          backgroundColor: "rgba(56, 78, 226, 0.2)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Target",
          data: [
            1000, 1010, 1020, 1030, 1040, 1050, 1060, 1070, 1080, 1090, 1100,
            1100,
          ],
          borderColor: "var(--soft-purple)",
          backgroundColor: "rgba(138, 128, 227, 0.2)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
    region: {
      labels: ["Americas", "Europe", "Asia", "Africa", "Pacific"],
      datasets: [
        {
          label: "Employees by Region",
          data: [2409, 2728, 2843, 3028, 1833],
          backgroundColor: [
            "var(--primary-blue)",
            "var(--soft-purple)",
            "var(--secondary-teal)",
            "var(--pale-blue-purple)",
            "var(--accent-blue)",
          ],
          borderWidth: 0,
        },
      ],
    },
    platform: {
      labels: ["Amazon", "Tokopedia", "Alibaba"],
      datasets: [
        {
          data: [45, 25, 30],
          backgroundColor: [
            "var(--primary-blue)",
            "var(--soft-purple)",
            "var(--secondary-teal)",
          ],
          borderWidth: 0,
        },
      ],
    },
    user: {
      labels: ["Total Users", "Active", "Inactive"],
      datasets: [
        {
          data: [2324, 1809, 515],
          backgroundColor: [
            "var(--accent-blue)",
            "var(--primary-blue)",
            "var(--soft-purple)",
          ],
          borderWidth: 0,
        },
      ],
    },
  });

  useEffect(() => {
    // Simulate real-time data updates every 10 seconds
    const interval = setInterval(() => {
      setData((prev) => ({
        ...prev,
        employee: {
          ...prev.employee,
          datasets: prev.employee.datasets.map((dataset) => ({
            ...dataset,
            data: dataset.data.map((val) =>
              Math.max(0, val + (Math.random() - 0.5) * 10)
            ),
          })),
        },
        region: {
          ...prev.region,
          datasets: prev.region.datasets.map((dataset) => ({
            ...dataset,
            data: dataset.data.map((val) =>
              Math.max(0, val + (Math.random() - 0.5) * 20)
            ),
          })),
        },
        platform: {
          ...prev.platform,
          datasets: prev.platform.datasets.map((dataset) => ({
            ...dataset,
            data: dataset.data.map((val) =>
              Math.max(0, val + (Math.random() - 0.5) * 5)
            ),
          })),
        },
        user: {
          ...prev.user,
          datasets: prev.user.datasets.map((dataset) => ({
            ...dataset,
            data: dataset.data.map((val) =>
              Math.max(0, val + (Math.random() - 0.5) * 10)
            ),
          })),
        },
      }));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "var(--secondary-lavender)", font: { size: 12 } },
      },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { color: "var(--secondary-lavender)" },
      },
      x: {
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { color: "var(--secondary-lavender)" },
      },
    },
    animation: { duration: 1000, easing: "easeInOutQuart" },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      <div className="glass p-4 rounded-xl hover:shadow-[0_0_20px_rgba(56,78,226,0.3)] transition-all animate-slide-up">
        <h2 className="text-sm font-medium text-[var(--secondary-lavender)] mb-4">
          Employee Growth
        </h2>
        <Line data={data.employee} options={options} />
      </div>
      <div className="glass p-4 rounded-xl hover:shadow-[0_0_20px_rgba(56,78,226,0.3)] transition-all animate-slide-up">
        <h2 className="text-sm font-medium text-[var(--secondary-lavender)] mb-4">
          Employees by Region
        </h2>
        <Bar data={data.region} options={options} />
      </div>
      <div className="glass p-4 rounded-xl hover:shadow-[0_0_20px_rgba(56,78,226,0.3)] transition-all animate-slide-up">
        <h2 className="text-sm font-medium text-[var(--secondary-lavender)] mb-4">
          Hiring by Platform
        </h2>
        <Pie data={data.platform} options={options} />
      </div>
      <div className="glass p-4 rounded-xl hover:shadow-[0_0_20px_rgba(56,78,226,0.3)] transition-all animate-slide-up">
        <h2 className="text-sm font-medium text-[var(--secondary-lavender)] mb-4">
          Registered Users
        </h2>
        <div className="flex justify-center">
          <Pie
            data={data.user}
            options={{ ...options, plugins: { legend: { display: false } } }}
          />
        </div>
        <div className="mt-4 text-center">
          <p className="text-lg font-medium text-[var(--secondary-lavender)]">
            2,324
          </p>
          <p className="text-xs text-[var(--pale-blue-purple)]">Total Users</p>
          <div className="mt-2 flex justify-center space-x-4 text-xs text-[var(--pale-blue-purple)]">
            <span>1,809 Active</span>
            <span>515 Inactive</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeChart;
