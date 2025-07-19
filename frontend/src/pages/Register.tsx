import React, { useState } from 'react';
import api from '../Services/api'; // ✅ make sure folder is actually named "Services" (uppercase)

const Register: React.FC = () => {
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        passwordHash: '',
        role: 'Buyer'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRegister = async () => {
        try {
            await api.post('/auth/register', form);
            alert('Registered successfully!');
        } catch (err) {
            alert('Registration failed!');
        }
    };

    return (
        <div>
            <h2>Register</h2>
            <input name="fullName" placeholder="Full Name" onChange={handleChange} />
            <input name="email" placeholder="Email" onChange={handleChange} />
            <input name="passwordHash" placeholder="Password" type="password" onChange={handleChange} />
            <select name="role" onChange={handleChange}>
                <option value="Buyer">Buyer</option>
                <option value="Seller">Seller</option>
            </select>
            <button onClick={handleRegister}>Register</button>
        </div>
    );
};

export default Register;
