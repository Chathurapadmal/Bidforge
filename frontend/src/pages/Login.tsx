import React, { useState } from 'react';
import api from '../Services/api';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const res = await api.post('/auth/login', {
                email,
                password
            });

            alert(res.data.message);
            localStorage.setItem('role', res.data.role); // Save role/token here if using JWT
        } catch (err) {
            alert('Login failed!');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
};

export default Login;
