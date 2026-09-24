import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { describe, expect, it, vi } from 'vitest';
import Login from './Login';
import Register from './Register';

vi.mock('axios');

describe('authentication forms', () => {
    it('shows validation errors and does not submit invalid login data', async () => {
        const user = userEvent.setup();
        render(<Login onSwitchToRegister={vi.fn()} />);

        await user.click(screen.getByRole('button', { name: 'Log In' }));

        expect(screen.getByText('Email is required.')).toBeInTheDocument();
        expect(screen.getByText('Password is required.')).toBeInTheDocument();
        expect(axios.post).not.toHaveBeenCalled();
    });

    it('submits login credentials and displays the server response', async () => {
        const user = userEvent.setup();
        axios.post.mockResolvedValue({ data: { message: 'Welcome back!' } });
        render(<Login onSwitchToRegister={vi.fn()} />);

        await user.type(screen.getByRole('textbox', { name: /Email Address/ }), 'user@example.com');
        await user.type(document.getElementById('login-password'), 'password123');
        await user.click(screen.getByRole('button', { name: 'Log In' }));

        expect(await screen.findByText('Welcome back!')).toBeInTheDocument();
        expect(axios.post).toHaveBeenCalledWith('http://localhost:5000/api/auth/login', {
            email: 'user@example.com',
            password: 'password123',
        });
    });

    it('displays server errors and toggles password visibility', async () => {
        const user = userEvent.setup();
        axios.post.mockRejectedValue({ response: { data: { message: 'Invalid credentials.' } } });
        render(<Login onSwitchToRegister={vi.fn()} />);

        const password = document.getElementById('login-password');
        expect(password).toHaveAttribute('type', 'password');
        await user.click(screen.getByRole('button', { name: 'toggle password visibility' }));
        expect(password).toHaveAttribute('type', 'text');
        await user.type(screen.getByRole('textbox', { name: /Email Address/ }), 'user@example.com');
        await user.type(password, 'password123');
        await user.click(screen.getByRole('button', { name: 'Log In' }));

        expect(await screen.findByText('Invalid credentials.')).toBeInTheDocument();
    });

    it('resets registration fields after a successful registration', async () => {
        const user = userEvent.setup();
        axios.post.mockResolvedValue({ data: {} });
        render(<Register onSwitchToLogin={vi.fn()} />);

        const email = screen.getByRole('textbox', { name: /Email Address/ });
        const password = document.getElementById('register-password');
        await user.type(email, 'new@example.com');
        await user.type(password, 'password123');
        await user.click(screen.getByRole('button', { name: 'Register' }));

        expect(await screen.findByText('Registration successful!')).toBeInTheDocument();
        expect(email).toHaveValue('');
        expect(password).toHaveValue('');
    });
});