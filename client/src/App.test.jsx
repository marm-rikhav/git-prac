import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

describe('authentication application', () => {
    it('switches between login and registration views and toggles theme', async () => {
        const user = userEvent.setup();
        render(<App />);

        expect(screen.getByRole('heading', { name: 'Log In' })).toBeInTheDocument();
        await user.click(screen.getByRole('tab', { name: 'Register' }));
        expect(screen.getByRole('heading', { name: 'Create an Account' })).toBeInTheDocument();

        const themeButton = screen.getByRole('button', { name: 'Switch to dark mode' });
        await user.click(themeButton);
        expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument();
    });

    it('switches views from the form links', async () => {
        const user = userEvent.setup();
        render(<App />);

        await user.click(screen.getByRole('button', { name: /Register here/ }));
        expect(screen.getByRole('heading', { name: 'Create an Account' })).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: /Log in here/ }));
        expect(screen.getByRole('heading', { name: 'Log In' })).toBeInTheDocument();
    });

    it('does not warn about missing required form props', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { });
        render(<App />);
        expect(consoleError).not.toHaveBeenCalled();
        consoleError.mockRestore();
    });
});