import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  
  const isPasswordValid = (pwd) => {
    const minLength = pwd.length >= 6;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    return minLength && hasUpperCase && hasNumber;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!isPasswordValid(password)) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 6 characters long and contain at least one uppercase letter and one number.',
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
          role: 'user',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Registration successful! Redirecting to login...' });
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Registration failed.' });
      }
    } catch (error) {
      console.error('Register error:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 via-blue-500 to-teal-400 px-4">
      <form
        onSubmit={handleRegister}
        className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-2xl"
      >
        <h2 className="text-4xl font-extrabold mb-4 text-center text-gray-800">Register</h2>
        <p className="mb-6 text-center text-gray-500 text-lg">Enter your details to create an account</p>

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
          type="text"
          placeholder="Enter your full name"
          className="w-full mb-4 p-4 text-base border border-gray-300 rounded-xl focus:outline-none"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Enter your email address"
          className="w-full mb-4 p-4 text-base border border-gray-300 rounded-xl focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            className="w-full mb-4 p-4 text-base border border-gray-300 rounded-xl focus:outline-none pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 text-lg"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '👁️‍🗨️' : '👁️'}
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-xl text-lg font-semibold hover:bg-blue-700 transition duration-200"
        >
          Sign Up
        </button>

        <div className="mt-6 text-center text-base text-gray-700">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline font-semibold">Log In</a>
        </div>
      </form>
    </div>
  );
};

export default Register;
