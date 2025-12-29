import React, { useState } from 'react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); 
    try {
      const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json(); 

      if (response.ok) {
        setMessage('Password reset link has been sent to your email.'); 
      } else {
        setMessage(data.message || 'Failed to send reset link.'); 
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred. Please try again later.'); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 via-blue-500 to-teal-400 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-2xl"
      >
        <h2 className="text-4xl font-extrabold mb-4 text-center text-gray-800">Forgot Password</h2>
        <p className="mb-6 text-center text-gray-500 text-lg">Enter your email to reset your password</p>

        {message && (
          <div
            className={`text-center text-sm px-4 py-2 mb-4 rounded-md ${message.includes('sent') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
          >
            {message}
          </div>
        )}

        <input
          type="email"
          placeholder="Enter your email address"
          className="w-full mb-4 p-4 text-base border border-gray-300 rounded-xl focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-xl text-lg font-semibold hover:bg-blue-700 transition duration-200"
        >
          Send Reset Link
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
