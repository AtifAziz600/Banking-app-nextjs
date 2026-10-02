"use client";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ accounts = [] }: DoughnutChartProps) => {
  const accountNames = accounts.map((account) => account.name);
  const accountBalances = accounts.map((account) => account.currentBalance);

  const data = {
    datasets: [
      {
        label: "Banks",
        data: accountBalances.length > 0 ? accountBalances : [1250, 2500, 3750],
        backgroundColor: ["#0747b6", "#2265d8", "#2f91fa"],
      },
    ],
    labels: accountNames.length > 0 ? accountNames : ["Bank 1", "Bank 2", "Bank 3"],
  };

  return (
    <Doughnut
      data={data}
      options={{
        cutout: "60%",
        plugins: {
          legend: {
            display: false,
          },
        },
      }}
    />
  );
};

export default DoughnutChart;
