import React from 'react';
import { Bar } from 'react-chartjs-2';

const Insights = ({ data }) => {
  const chartData = {
    labels: data.map((item) => item.category),
    datasets: [
      {
        label: 'Expenses',
        data: data.map((item) => item.amount),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  return (
    <div>
      <h2>Spending Insights</h2>
      <Bar data={chartData} />
    </div>
  );
};

export default Insights;