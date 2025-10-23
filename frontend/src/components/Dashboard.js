import React, { useEffect, useMemo, useState } from 'react';
import './Dashboard.css';
import { ExpenseAPI } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, ArcElement, BarElement, PointElement, LineElement, Tooltip, Legend);

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await ExpenseAPI.listExpenses();
        setExpenses(Array.isArray(data) ? data : []);
      } catch (e) {
        // fallback demo
        setExpenses([
          { date: '2025-10-01', category: 'Food', amount: 120, description: 'Lunch' },
          { date: '2025-10-03', category: 'Transport', amount: 80, description: 'Taxi' },
          { date: '2025-10-06', category: 'Bills', amount: 200, description: 'Electricity' },
        ]);
      }
    };
    fetch();
  }, []);

  const totals = useMemo(() => {
    const sum = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
    const byCat = expenses.reduce((acc, e) => {
      const cat = e.category || 'Other';
      acc[cat] = (acc[cat] || 0) + Number(e.amount || 0);
      return acc;
    }, {});
    const topCat = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    
    // Calculate insights
    const avgExpense = expenses.length > 0 ? (sum / expenses.length).toFixed(2) : 0;
    const foodSpend = byCat['Food'] || 0;
    const transportSpend = byCat['Transport'] || 0;
    
    return { sum, byCat, topCat, avgExpense, foodSpend, transportSpend };
  }, [expenses]);

  const barData = {
    labels: Object.keys(totals.byCat),
    datasets: [
      { label: 'By Category', data: Object.values(totals.byCat), backgroundColor: 'rgba(0,168,168,0.6)' },
    ],
  };

  const pieData = barData;

  const lineData = {
    labels: expenses.map((e) => e.date),
    datasets: [
      { label: 'Daily Spend', data: expenses.map((e) => Number(e.amount || 0)), borderColor: '#007BFF' },
    ],
  };

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      <div className="summary-cards">
        <div className="card">Total Spent: {totals.sum}</div>
        <div className="card">Top Category: {totals.topCat}</div>
        <div className="card">Avg Expense: {totals.avgExpense}</div>
      </div>
      
      {/* AI Insights Panel */}
      <div style={{ marginTop: 24, padding: 16, backgroundColor: '#E8F5F5', borderRadius: 8 }}>
        <h3>💡 AI Insights</h3>
        {totals.foodSpend > 0 && (
          <p>🍔 Food spending: ${totals.foodSpend}. Consider meal planning to save more!</p>
        )}
        {totals.transportSpend > 0 && (
          <p>🚗 Transport costs: ${totals.transportSpend}. Explore carpooling options.</p>
        )}
        {expenses.length > 5 && (
          <p>📊 You've logged {expenses.length} expenses. Great job tracking!</p>
        )}
        {expenses.length === 0 && (
          <p>📝 No expenses yet. Start by adding your first expense!</p>
        )}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
        <Bar data={barData} />
        <Pie data={pieData} />
      </div>
      <div style={{ marginTop: 24 }}>
        <Line data={lineData} />
      </div>
    </div>
  );
};

export default Dashboard;