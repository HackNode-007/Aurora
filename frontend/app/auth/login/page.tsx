"use client";
import React, { useState } from "react";
import axios from "axios";

export default function LoginPage() {
    const [Email, setEmail] = useState<string>("");
    const [Password, setPassword] = useState<string>("");
    const [Loading, setLoading] = useState<boolean>(false);
    const [Error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/api/auth/login', {
                email: Email,
                password: Password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const { token, message } = response.data;
            console.log("Login successful:", message);
            console.log("JWT Token:", token);

            localStorage.setItem('authToken', token);

            alert("Login successful!");
        } catch (err: any) {
            if (err.response) {
                setError(err.response.data.message || 'Login failed');
            } else {
                setError('Network error or server not reachable');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50"></div>

            <div className="fixed bottom-6 left-6">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
        
                </div>
            </div>

            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
                <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-xl">A</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back to Aurora</h1>
                    <p className="text-gray-600 text-sm">Login to continue to your dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="p-6 space-y-6">
                    <button
                        type="button"
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                        disabled={Loading}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F5" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.99 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.78 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.24-1.37-.24-2.84-.24-4.09 0-1.25 0-2.72.24-4.09V7.07H2.18C1.43 8.58 1 10.34 1 12s.43 3.42 1.18 4.93l3.66-2.84z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.41 1 12 1c-2.41 0-5.45.99-7.34 2.84l5.58 5.6c.75-1.23 2.3-2.5 4.21-2.5z"/>
                        </svg>
                        <span className="text-gray-700 font-medium">Continue with Google</span>
                    </button>

                    <div className="flex items-center my-4">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-4 text-gray-500 text-sm font-medium">OR CONTINUE WITH</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={Email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={Password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {Error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            {Error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={Loading}
                        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {Loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                            </>
                        ) : (
                            "Login"
                        )}
                    </button>

                    <p className="text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <a href="#" className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200">
                            Register
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
}

