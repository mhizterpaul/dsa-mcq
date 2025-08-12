import { User } from '../store/primitives/User';

// Mock AuthServer API
const FAKE_JWT_TOKEN = 'fake-jwt-token';

export const login = async (username: string, password: string):Promise<{ user: User, token: string }> => {
    console.log(`Attempting to log in user: ${username}`);
    // In a real app, this would be an API call to the AuthServer.
    // We'll simulate a successful login.
    if (password === 'password') {
        const user = new User('1', username, `${username}@example.com`);
        return Promise.resolve({ user, token: FAKE_JWT_TOKEN });
    } else {
        return Promise.reject(new Error('Invalid credentials'));
    }
};

export const register = async (username: string, email: string, password: string):Promise<{ user: User }> => {
    console.log(`Attempting to register user: ${username}`);
    // In a real app, this would be an API call to the AuthServer.
    // We'll simulate a successful registration.
    const user = new User(String(Math.random()), username, email);
    return Promise.resolve({ user });
};

export const logout = async (): Promise<void> => {
    console.log('Logging out user');
    // In a real app, this might involve invalidating a token on the server.
    return Promise.resolve();
};
