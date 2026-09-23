import React, { useMemo, useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Tabs,
  Tab,
  Typography,
  ThemeProvider,
  createTheme,
  CssBaseline,
  IconButton,
  Tooltip,
} from '@mui/material';
import Login from './components/Login';
import Register from './components/Register';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import Avatar from '@mui/material/Avatar';

export default function App() {
  const [tabIndex, setTabIndex] = useState(0);
  const [mode, setMode] = useState('light');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
        },
      }),
    [mode],
  );

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        maxWidth="xs"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 3,
          bgcolor: 'background.default',
        }}
      >
        <Paper elevation={4} sx={{ width: '100%', p: 4, borderRadius: 3 }}>
          <Box position="relative" display="flex" flexDirection="column" alignItems="center" mb={2}>
            <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
              <IconButton
                aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                onClick={() => setMode((currentMode) => (currentMode === 'light' ? 'dark' : 'light'))}
                sx={{ position: 'absolute', top: -8, right: -8 }}
              >
                {mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
              </IconButton>
            </Tooltip>
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
    </ThemeProvider>
  );
}
