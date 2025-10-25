import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Box,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { BudgetAPI } from '../services/api';

const CATEGORIES = [
  'Food',
  'Transport',
  'Entertainment',
  'Shopping',
  'Bills',
  'Healthcare',
  'Education',
  'Other',
];

const BudgetSettings = () => {
  const [budgets, setBudgets] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth]);

  const loadBudgets = async () => {
    try {
      const { data } = await BudgetAPI.getBudgets(currentMonth);
      setBudgets(data);
    } catch (err) {
      setError('Failed to load budgets');
    }
  };

  const handleAddBudget = async () => {
    if (!newCategory || !newLimit) {
      setError('Please select category and enter limit');
      return;
    }

    try {
      await BudgetAPI.setBudget(newCategory, parseFloat(newLimit), currentMonth);
      setMessage(`Budget set for ${newCategory}: ${newLimit}`);
      setNewCategory('');
      setNewLimit('');
      loadBudgets();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to set budget');
    }
  };

  const handleDeleteBudget = async (id) => {
    try {
      await BudgetAPI.deleteBudget(id);
      setMessage('Budget deleted');
      loadBudgets();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to delete budget');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Monthly Budget Settings
      </Typography>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Set Budget for {currentMonth}
        </Typography>
        
        <TextField
          type="month"
          value={currentMonth}
          onChange={(e) => setCurrentMonth(e.target.value)}
          sx={{ mb: 2, mr: 2 }}
          size="small"
        />

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={5}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newCategory}
                label="Category"
                onChange={(e) => setNewCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              type="number"
              label="Monthly Limit"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              placeholder="e.g., 5000"
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddBudget}
              sx={{ height: '56px' }}
            >
              Add
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Current Budgets
      </Typography>

      {budgets.length === 0 ? (
        <Alert severity="info">No budgets set for this month. Add one above!</Alert>
      ) : (
        <Grid container spacing={2}>
          {budgets.map((budget) => (
            <Grid item xs={12} sm={6} md={4} key={budget.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" color="primary">
                      {budget.category}
                    </Typography>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteBudget(budget.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="h5" sx={{ mt: 1 }}>
                    ${budget.monthly_limit.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Month: {budget.month}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default BudgetSettings;
