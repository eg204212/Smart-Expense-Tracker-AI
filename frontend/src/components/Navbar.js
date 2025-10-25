import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <h1>Smart Expense Tracker</h1>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/add-expense">Add Expense</Link></li>
        <li><Link to="/expense-history">History</Link></li>
        <li><Link to="/insights">Insights</Link></li>
        <li><Link to="/budget">Budget</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;