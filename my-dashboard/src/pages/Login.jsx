// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token && data.role && data.user_id) {
        const token = data.token;
        const role = data.role;
        const user_id = data.user_id;

        if (rememberMe) {
          localStorage.setItem('token', token);
          localStorage.setItem('role', role);
          localStorage.setItem('user_id', user_id);
        } else {
          sessionStorage.setItem('token', token);
          sessionStorage.setItem('role', role);
          sessionStorage.setItem('user_id', user_id);
        }

        setUser({ user_id, role, token });

        if (role === 'admin') {
          navigate('/admin-panel');
        } else {
          navigate('/');
        }

        
        setTimeout(() => window.location.reload(), 100);
      } else {
        setMessage({ type: 'error', text: data.message || 'Login failed' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage({ type: 'error', text: 'An error occurred during login.' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 via-blue-500 to-teal-400 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-2xl"
      >
        <h2 className="text-4xl font-extrabold mb-4 text-center text-gray-800">Log In</h2>
        <p className="mb-6 text-center text-gray-500 text-lg">Sign in to continue</p>

        {message.text && (
          <div
            className={`text-center text-sm px-4 py-2 mb-4 rounded-md ${
              message.type === 'error'
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <input
          type="email"
          placeholder="Enter your email address"
          className="w-full mb-4 p-4 border border-gray-300 rounded-xl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            className="w-full mb-4 p-4 border border-gray-300 rounded-xl pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 transform -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '👁️‍🗨️' : '👁️'}
          </button>
        </div>

        <div className="flex justify-between items-center mb-6 text-sm">
          <label>
            <input
              type="checkbox"
              className="mr-2"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember Me
          </label>
          <Link to="/forgot-password" className="text-blue-600">Forgot Password</Link>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-xl text-lg font-semibold hover:bg-blue-700 transition"
        >
          Sign In
        </button>

        <div className="mt-6 text-center text-base text-gray-700">
          Don’t have an account?{' '}
          <a href="/register" className="text-blue-600 font-semibold">Sign Up</a>
        </div>
      </form>
    </div>
  );
};

export default Login;
