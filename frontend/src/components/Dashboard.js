import React, { useEffect, useMemo, useState } from 'react';
import './Dashboard.css';
import { ExpenseAPI } from '../services/api';
import BudgetAlerts from './BudgetAlerts';
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
import { Container, Grid, Paper, Typography, Box, Card, CardContent } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CategoryIcon from '@mui/icons-material/Category';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Budget Alerts */}
      <BudgetAlerts />

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Spent
                  </Typography>
                  <Typography variant="h4">${totals.sum.toFixed(2)}</Typography>
                </Box>
                <AttachMoneyIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Top Category
                  </Typography>
                  <Typography variant="h5">{totals.topCat}</Typography>
                </Box>
                <CategoryIcon color="secondary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Avg Expense
                  </Typography>
                  <Typography variant="h5">${totals.avgExpense}</Typography>
                </Box>
                <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* AI Insights */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: '#E8F5F5' }}>
        <Typography variant="h6" gutterBottom>
          💡 AI Insights
        </Typography>
        {totals.foodSpend > 0 && (
          <Typography variant="body2" paragraph>
            🍔 Food spending: ${totals.foodSpend.toFixed(2)}. Consider meal planning to save more!
          </Typography>
        )}
        {totals.transportSpend > 0 && (
          <Typography variant="body2" paragraph>
            🚗 Transport costs: ${totals.transportSpend.toFixed(2)}. Explore carpooling options.
          </Typography>
        )}
        {expenses.length > 5 && (
          <Typography variant="body2" paragraph>
            📊 You've logged {expenses.length} expenses. Great job tracking!
          </Typography>
        )}
        {expenses.length === 0 && (
          <Typography variant="body2">
            📝 No expenses yet. Start by adding your first expense!
          </Typography>
        )}
      </Paper>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Spending by Category
            </Typography>
            <Box sx={{ height: 300 }}>
              <Pie data={pieData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Category Breakdown
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar data={barData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Spending Trend
            </Typography>
            <Box sx={{ height: 250 }}>
              <Line data={lineData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;