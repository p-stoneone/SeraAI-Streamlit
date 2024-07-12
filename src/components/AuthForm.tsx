import React, { useState } from 'react';
import Container from "react-bootstrap/Container";

interface AuthFormProps {
    onAuthSuccess: (password: string) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await fetch('/api/authenticate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password }),
        });

        const result = await response.json();

        if (result.authorized) {
            onAuthSuccess(password);  // Pass the entered password
        } else {
            setError('Incorrect password');
        }
    };

    return (
        <>
            <Container as="main">
                <div className="text-center justify-content-center align-items-center py-5 d-flex">
                    <form onSubmit={handleSubmit} className='pb-3'>
                        <div>
                            <label htmlFor="password" className='me-1'>Enter Password: </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        <button className='btn btn-primary mt-3' type="submit">Submit</button>
                    </form>
                </div>
            </Container>
        </>
    );
};

export default AuthForm;