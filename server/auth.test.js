const request = require('supertest');

jest.mock('./models/User', () => {
    const User = jest.fn((data) => ({
        ...data,
        _id: 'new-user-id',
        save: jest.fn().mockResolvedValue(),
    }));
    User.findOne = jest.fn();
    return User;
});

jest.mock('bcryptjs', () => ({
    genSalt: jest.fn().mockResolvedValue('salt'),
    hash: jest.fn().mockResolvedValue('hashed-password'),
    compare: jest.fn(),
}));

const { app } = require('./index');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

describe('server startup', () => {
    it('connects to MongoDB before listening', async () => {
        mongoose.connect = jest.fn().mockResolvedValue();
        app.listen = jest.fn((port, callback) => callback());
        const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => { });

        await require('./index').startServer();

        expect(mongoose.connect).toHaveBeenCalled();
        expect(app.listen).toHaveBeenCalled();
        expect(consoleLog).toHaveBeenCalledWith(expect.stringContaining('Successfully connected'));
        consoleLog.mockRestore();
    });

    it('starts listening when MongoDB is unavailable', async () => {
        mongoose.connect = jest.fn().mockRejectedValue(new Error('database unavailable'));
        app.listen = jest.fn((port, callback) => callback());
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => { });
        const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => { });

        await require('./index').startServer();

        expect(consoleError).toHaveBeenCalledWith('MongoDB connection error:', expect.any(Error));
        expect(app.listen).toHaveBeenCalled();
        expect(consoleLog).toHaveBeenCalledWith(expect.stringContaining('MongoDB disconnected'));
        consoleError.mockRestore();
        consoleLog.mockRestore();
    });
});

describe('health route', () => {
    it('reports that the server is running', async () => {
        const response = await request(app).get('/api/health');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'OK', message: 'Server is running' });
    });
});

describe('authentication routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('rejects invalid registration input', async () => {
        const response = await request(app).post('/api/auth/register').send({ email: 'bad', password: 'short' });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid email format.');
        expect(User.findOne).not.toHaveBeenCalled();
    });

    it('registers a new user with a hashed password', async () => {
        User.findOne.mockResolvedValue(null);
        const response = await request(app)
            .post('/api/auth/register')
            .send({ email: ' User@Example.com ', password: 'password123' });

        expect(response.status).toBe(201);
        expect(User.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
        expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
        expect(response.body).toEqual({
            message: 'User registered successfully!',
            user: { id: 'new-user-id', email: 'user@example.com' },
        });
    });

    it('rejects registration when the email is already registered', async () => {
        User.findOne.mockResolvedValue({ email: 'user@example.com' });
        const response = await request(app)
            .post('/api/auth/register')
            .send({ email: 'user@example.com', password: 'password123' });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Email is already registered.');
    });

    it('logs in with valid credentials', async () => {
        User.findOne.mockResolvedValue({ _id: 'user-id', email: 'user@example.com', password: 'hashed-password' });
        bcrypt.compare.mockResolvedValue(true);
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'USER@example.com', password: 'password123' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: 'Login successful!',
            user: { id: 'user-id', email: 'user@example.com' },
        });
    });

    it('rejects an unknown user and an incorrect password', async () => {
        User.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({ password: 'hashed-password' });
        bcrypt.compare.mockResolvedValue(false);

        const missingUser = await request(app)
            .post('/api/auth/login')
            .send({ email: 'missing@example.com', password: 'password123' });
        const wrongPassword = await request(app)
            .post('/api/auth/login')
            .send({ email: 'user@example.com', password: 'password123' });

        expect(missingUser.body.message).toBe('Invalid credentials. User not found.');
        expect(wrongPassword.body.message).toBe('Invalid credentials. Incorrect password.');
    });
});