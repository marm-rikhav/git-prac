import { useState } from 'react';
import axios from 'axios';

const isValidEmail = (email) => {
    const atIndex = email.indexOf('@');
    const domain = email.slice(atIndex + 1);

    return (
        atIndex > 0 &&
        atIndex === email.lastIndexOf('@') &&
        !email.includes(' ') &&
        domain.includes('.') &&
        !domain.startsWith('.') &&
        !domain.endsWith('.')
    );
};

export default function useAuthForm({
    endpoint,
    invalidEmailMessage,
    successMessage,
    fallbackErrorMessage,
    resetOnSuccess = false,
}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState();
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [serverMessage, setServerMessage] = useState(null);
    const [serverError, setServerError] = useState(null);
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!email) {
            newErrors.email = 'Email is required.';
        } else if (!isValidEmail(email)) {
            newErrors.email = invalidEmailMessage;
        }

        if (!password) {
            newErrors.password = 'Password is required.';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setServerMessage(null);
        setServerError(null);

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(endpoint, { email, password });
            setServerMessage(response.data.message || successMessage);
            if (resetOnSuccess) {
                setEmail('');
                setPassword();
            }
            setErrors({});
        } catch (error) {
            const message = error.response?.data?.message || fallbackErrorMessage;
            setServerError(message);
        } finally {
            setLoading(false);
        }
    };

    return {
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
    };
}
