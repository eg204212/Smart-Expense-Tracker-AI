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
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

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
    <Container maxWidth="xl" sx={{ mt: 2, mb: 2, py: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            fontWeight: 700, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 0.5
          }}
        >
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track your expenses and manage your budget effectively
        </Typography>
      </Box>

      {/* Budget Alerts */}
      <Box sx={{ mb: 2 }}>
        <BudgetAlerts />
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
              }
            }}
          >
            <CardContent sx={{ py: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Total Spent
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Rs. {totals.sum.toFixed(2)}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    borderRadius: '50%', 
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <AccountBalanceWalletIcon sx={{ fontSize: 32 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(245, 87, 108, 0.4)',
              }
            }}
          >
            <CardContent sx={{ py: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Top Category
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {totals.topCat}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    borderRadius: '50%', 
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CategoryIcon sx={{ fontSize: 32 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(79, 172, 254, 0.4)',
              }
            }}
          >
            <CardContent sx={{ py: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Avg Expense
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Rs. {totals.avgExpense}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    borderRadius: '50%', 
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: 32 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts - 2 rows layout for better screenshot */}
      <Grid container spacing={2}>
        {/* Top Row: Pie and Bar Charts */}
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
              }
            }}
          >
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#424242', mb: 1 }}>
              📊 Spending by Category
            </Typography>
            <Box sx={{ height: 220 }}>
              <Pie data={pieData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
              }
            }}
          >
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#424242', mb: 1 }}>
              � Category Breakdown
            </Typography>
            <Box sx={{ height: 220 }}>
              <Bar data={barData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>

        {/* Bottom Row: Line Chart and AI Insights */}
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
              }
            }}
          >
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#424242', mb: 1 }}>
              � Spending Trend
            </Typography>
            <Box sx={{ height: 200 }}>
              <Line data={lineData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 2, 
              background: 'linear-gradient(135deg, #e0f7fa 0%, #e1f5fe 100%)',
              borderRadius: 2,
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              border: '1px solid rgba(79, 172, 254, 0.1)',
              height: '100%'
            }}
          >
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#00695c' }}>
              💡 AI Insights
            </Typography>
            <Box sx={{ fontSize: '0.875rem' }}>
              {totals.foodSpend > 0 && (
                <Typography variant="body2" paragraph sx={{ color: '#004d40', mb: 1 }}>
                  🍔 Food: Rs. {totals.foodSpend.toFixed(2)}. Consider meal planning!
                </Typography>
              )}
              {totals.transportSpend > 0 && (
                <Typography variant="body2" paragraph sx={{ color: '#004d40', mb: 1 }}>
                  � Transport: Rs. {totals.transportSpend.toFixed(2)}. Try carpooling!
                </Typography>
              )}
              {expenses.length > 5 && (
                <Typography variant="body2" paragraph sx={{ mb: 1 }}>
                  📊 {expenses.length} expenses logged. Great tracking!
                </Typography>
              )}
              {expenses.length === 0 && (
                <Typography variant="body2">
                  📝 No expenses yet. Add your first expense!
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;