import React, { useState } from 'react';
import { ExpenseAPI } from '../services/api';

const UploadReceipt = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file first.');
      return;
    }

    try {
      const response = await ExpenseAPI.uploadReceipt(file);
      const text = response.data?.text || response.data?.extracted_text || '';
      setMessage(text ? `Extracted text length: ${text.length}` : 'Uploaded successfully.');
    } catch (error) {
      setMessage('Error uploading file.');
    }
  };

  return (
    
    <div>
      <h2>Upload Receipt</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default UploadReceipt;