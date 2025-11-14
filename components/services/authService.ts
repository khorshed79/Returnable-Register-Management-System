import { User } from '../types';

export const loginUser = async (sheetUrl: string, email: string, password: string): Promise<User | null> => {
    const response = await fetch(sheetUrl, {
        method: 'POST',
        body: JSON.stringify({ action: 'login', email, password }),
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
    });

    if (!response.ok) {
        throw new Error('Network response was not ok.');
    }

    const result = await response.json();

    if (result.status === 'success') {
        return result.user as User;
    } else {
        throw new Error(result.message || 'Login failed.');
    }
};

export const signupUser = async (sheetUrl: string, userData: Omit<User, 'id'>): Promise<void> => {
    
    const response = await fetch(sheetUrl, {
        method: 'POST',
        body: JSON.stringify({ ...userData, action: 'signup' }), // Add action for the script
        headers: {
            'Content-Type': 'text/plain;charset=utf-8', // Required for Apps Script doPost with e.postData.contents
        },
    });

    if (!response.ok) {
        throw new Error('Network response was not ok during signup.');
    }

    const result = await response.json();

    if (result.status !== 'success') {
        throw new Error(result.message || 'Signup failed.');
    }
};