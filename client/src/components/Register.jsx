import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import useAuthForm from '../hooks/useAuthForm';

export default function Register({ onSwitchToLogin }) {
  const form = useAuthForm({
    endpoint: 'http://localhost:5000/api/auth/register',
    invalidEmailMessage: 'Please enter a valid email address (e.g. user@example.com).',
    successMessage: 'Registration successful!',
    fallbackErrorMessage: 'Registration failed. Please try again.',
    resetOnSuccess: true,
  });
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    errors,
    serverMessage,
    serverError,
    loading,
    handleSubmit,
  } = form;

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <Typography variant="h5" component="h1" gutterBottom align="center" fontWeight="bold">
        Create an Account
      </Typography>

      {serverMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {serverMessage}
        </Alert>
      )}

      {serverError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {serverError}
        </Alert>
      )}

      <TextField
        margin="normal"
        required
        fullWidth
        id="register-email"
        label="Email Address"
        name="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={Boolean(errors.email)}
        helperText={errors.email}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        id="register-password"
        autoComplete="new-password"
        value={password ?? ''}
        onChange={(e) => setPassword(e.target.value)}
        error={Boolean(errors.password)}
        helperText={errors.password || 'Minimum 8 characters'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Show/Hide password checkbox */}
      <FormControlLabel
        control={
          <Checkbox
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            color="primary"
          />
        }
        label="Show Password"
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading}
        sx={{ mt: 3, mb: 2 }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
      </Button>

      <Box textAlign="center">
        <Typography variant="body2">
          Already have an account?{' '}
          <Button color="primary" onClick={onSwitchToLogin} sx={{ textTransform: 'none' }}>
            Log in here
          </Button>
        </Typography>
      </Box>
    </Box>
  );
}

Register.propTypes = {
  onSwitchToLogin: PropTypes.func.isRequired,
};
