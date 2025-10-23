import React, { useEffect, useMemo, useState } from 'react';
import { ExpenseAPI } from '../services/api';
import './ExpenseHistory.css';

const ExpenseHistory = () => {
  const [expenses, setExpenses] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const { data } = await ExpenseAPI.listExpenses();
        setExpenses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      }
    };

    fetchExpenses();
  }, []);

  const categories = useMemo(() => Array.from(new Set(expenses.map((e) => e.category || 'Other'))), [expenses]);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const q = query.toLowerCase();
      const matchesQuery = !q || `${e.description || ''} ${e.vendor || ''} ${e.category || ''}`.toLowerCase().includes(q);
      const matchesCat = !category || (e.category || 'Other') === category;
      return matchesQuery && matchesCat;
    });
  }, [expenses, query, category]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await ExpenseAPI.deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id && e._id !== id));
    } catch (e) {
      alert('Failed to delete expense.');
    }
  };

  return (
    <div className="expense-history-container">
      <h2>Expense History</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input placeholder="Search by vendor or category" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Vendor</th>
            <th>Category</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((expense) => (
            <tr key={expense.id || expense._id}>
              <td>{expense.date || ''}</td>
              <td>{expense.vendor || ''}</td>
              <td>{expense.category || ''}</td>
              <td>{expense.description || ''}</td>
              <td>{expense.amount}</td>
              <td>
                {/* Edit flow could open a modal - omitted for brevity */}
                <button onClick={() => alert('Edit not implemented in this demo')}>Edit</button>
                <button onClick={() => handleDelete(expense.id || expense._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseHistory;