import React, { useState } from 'react';
import { ExpenseAPI } from '../services/api';
import './AddExpense.css';

const AddExpense = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [vendor, setVendor] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [confidence, setConfidence] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const f = event.target.files[0];
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  };

  const extractFromText = async (text) => {
    // naive extraction helpers
    const lines = text.split(/\n|\r/).map((l) => l.trim()).filter(Boolean);
    if (!description && lines[0]) setDescription(lines[0]);
    if (!vendor && lines[0]) setVendor(lines[0].split(/\s{2,}|-/)[0]);
    const amountMatch = text.match(/(?:Rs\.?\s*|LKR\s*|\$)?\s*([0-9]+(?:[.,][0-9]{2})?)/i);
    if (!amount && amountMatch) setAmount(amountMatch[1].replace(',', ''));
    const dateMatch = text.match(/(\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})/);
    if (!date && dateMatch) setDate(dateMatch[1]);
    try {
      const { data } = await ExpenseAPI.categorize(text);
      if (data?.category) setCategory(data.category);
      if (data?.confidence) setConfidence(Math.round(data.confidence * 100));
    } catch (e) {
      // ignore categorize failure
    }
  };

  const handleExtract = async () => {
    if (!file) {
      setMessage('Please choose a receipt image first.');
      return;
    }
    setLoading(true);
    setMessage('Extracting details...');
    try {
      const { data } = await ExpenseAPI.uploadReceipt(file);
      const text = data?.text || data?.extracted_text || '';
      if (text) await extractFromText(text);
      setMessage('Details extracted. Review and save.');
    } catch (e) {
      setMessage('Failed to extract details. You can enter them manually.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExpense = async () => {
    try {
      await ExpenseAPI.addExpense({ vendor, date, description, amount: Number(amount), category });
      setMessage('Expense saved successfully!');
    } catch (error) {
      setMessage('Failed to save expense.');
    }
  };

  return (
    <div className="add-expense-container">
      <h2>Add Expense</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {preview && (
        <div style={{ margin: '10px 0' }}>
          <img src={preview} alt="preview" style={{ maxWidth: '100%', borderRadius: 8 }} />
        </div>
      )}
      <button onClick={handleExtract} disabled={loading}>{loading ? 'Extracting...' : 'Extract Details'}</button>
      {confidence != null && (
        <p>AI suggested category: <strong>{category || '—'}</strong> {confidence != null && `(confidence: ${confidence}%)`}</p>
      )}
      <input type="text" placeholder="Vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} />
      <input type="date" placeholder="Date" value={date} onChange={(e) => setDate(e.target.value)} />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <button onClick={handleSaveExpense}>Save Expense</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AddExpense;