import React from 'react';
import { Link } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

const Home = () => {
  return (
    <>
      <Box sx={{ bgcolor: '#F6F8FA', py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Smart Expense Tracker with AI Insights
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Scan. Save. Spend Smart.
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Button component={Link} to="/login" variant="contained" sx={{ mr: 2 }}>Get Started</Button>
            <Button component={Link} to="/register" variant="outlined">Create Account</Button>
          </Box>
        </Container>
      </Box>

      <Container sx={{ py: 6 }}>
        <Typography variant="h5" align="center" gutterBottom>Features</Typography>
        <Grid container spacing={3}>
          {[
            { title: 'OCR Receipt Scanning', desc: 'Upload receipts and let OCR extract details automatically.' },
            { title: 'AI Categorization', desc: 'ML suggests the right category for each expense.' },
            { title: 'Data Visualization', desc: 'Charts to visualize spending trends and distributions.' },
            { title: 'Budget Alerts', desc: 'Stay within budget with timely insights.' },
          ].map((f) => (
            <Grid item xs={12} sm={6} key={f.title}>
              <Box sx={{ p: 3, border: '1px solid #eee', borderRadius: 2 }}>
                <Typography variant="h6">{f.title}</Typography>
                <Typography color="text.secondary">{f.desc}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
};

export default Home;