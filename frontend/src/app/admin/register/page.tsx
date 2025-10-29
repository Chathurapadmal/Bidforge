"use client";
import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:7163";

export default function AdminRegisterPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
        role: "Admin", // Fixed to Admin for admin registration
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/api/auth/register-admin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            setMessage(`Admin user created successfully!`);
            setFormData({ email: "", password: "", name: "", role: "Admin" });
        } catch (err: any) {
            setError(err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Admin Registration
                    </h2>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-black">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-black"
                                placeholder="Enter email address"
                            />
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-black">
                                Full Name (Optional)
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-black"
                                placeholder="Enter full name"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-black">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-black"
                                placeholder="Enter password (min 6 characters)"
                            />
                        </div>


                    </div>

                    {error && (
                        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">
                            {message}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Creating..." : "Create Admin"}
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <a
                        href="/admin/users"
                        className="text-sm text-black hover:text-gray-700 underline"
                    >
                        Go to User Management
                    </a>
                </div>
            </div>
        </div>
    );
}