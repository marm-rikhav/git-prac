import React, { useState } from 'react';
import { Container, Paper, Box, Tabs, Tab, Typography } from '@mui/material';
import Login from './components/Login';
import Register from './components/Register';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';

export default function App() {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Container maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={4} sx={{ width: '100%', p: 4, borderRadius: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography variant="h6" fontWeight="bold">
            Authentication System
          </Typography>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabIndex} onChange={handleTabChange} variant="fullWidth">
            <Tab label="Log In" />
            <Tab label="Register" />
          </Tabs>
        </Box>

        {tabIndex === 0 && <Login onSwitchToRegister={() => setTabIndex(1)} />}
        {tabIndex === 1 && <Register onSwitchToLogin={() => setTabIndex(0)} />}
      </Paper>
    </Container>
  );
}
