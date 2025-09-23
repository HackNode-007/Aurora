"use client"

import React, { useState } from 'react';
import axios from 'axios';
import { InputField } from '../../../components/ui/InputField';
import { Button } from '../../../components/ui/Button';
import router from 'next/router';

const AuroraLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      console.log('Login successful:', response.data);

      document.cookie = `authToken=${response.data.token}; path=/; secure; samesite=strict`;

      router.push('/dashboard');
      alert('Login successful! Redirecting to dashboard...');

    } catch (err: any) {
      if (err.response) {
        switch (err.response.status) {
          case 400:
            setError('Invalid input format');
            break;
          case 401:
            setError('Invalid credentials');
            break;
          case 404:
            setError('User not found');
            break;
          case 500:
            setError('Server error. Please try again later.');
            break;
          default:
            setError('An unexpected error occurred');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
      router.push("/auth/register");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-5">
      <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl text-blue-600 font-semibold mb-2">Aurora</h1>
          <p className="text-gray-500 text-sm">Login to continue to your dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="mb-6">
          <InputField
            label="Email"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />

          <InputField
            label="Password"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          {error && (
            <div className="text-red-600 text-sm text-center mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" isLoading={isLoading} disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <button
                type="button"
                onClick={handleLoginRedirect}
                className="font-medium text-black hover:text-gray-800 hover:underline"
            >
                Login
            </button>
        </p>
        
      </div>
      
    </div>
  );
};

export default AuroraLogin;