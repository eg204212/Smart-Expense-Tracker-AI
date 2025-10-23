import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const Profile = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('LKR');
  const [message, setMessage] = useState('');

  const handleUpdate = async () => {
    // TODO: Call backend to persist profile settings
    setMessage('Profile updated (local demo).');
  };

  return (
    <Box maxWidth={600} mx="auto">
      <Typography variant="h5" mb={2}>Profile / Settings</Typography>
      <TextField fullWidth label="Name" value={name} onChange={(e) => setName(e.target.value)} margin="normal" />
      <TextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" />
      <TextField fullWidth label="Monthly Budget" value={budget} onChange={(e) => setBudget(e.target.value)} margin="normal" />
      <TextField fullWidth label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} margin="normal" />
      <Button variant="contained" sx={{ mt: 2 }} onClick={handleUpdate}>Update</Button>
      {message && <Typography sx={{ mt: 2 }}>{message}</Typography>}
    </Box>
  );
};

export default Profile;
