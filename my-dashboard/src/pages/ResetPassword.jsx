import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;

    console.log("Şifre:", password, "| Onay:", confirmPassword);

    if (password !== confirmPassword) {
      setMessage('Şifreler birebir aynı olmalıdır.');
      return;
    }

    if (password.trim().length < 6) {
      setMessage('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Şifre başarıyla güncellendi.');
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(data.message || 'Şifre güncellenemedi.');
      }
    } catch (error) {
      console.error(error);
      setMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 via-blue-500 to-teal-400 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-2xl"
      >
        <h2 className="text-4xl font-extrabold mb-4 text-center text-gray-800">Şifreni Sıfırla</h2>
        <p className="mb-6 text-center text-gray-500 text-lg">Yeni şifrenizi girin</p>

        {message && (
          <div
            className={`text-center text-sm px-4 py-2 mb-4 rounded-md ${
              message.includes('başarı') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {message}
          </div>
        )}

        {/* Şifre Alanı */}
        <div className="relative">
          <input
            type={passwordVisible ? 'text' : 'password'}
            name="password"
            placeholder="Yeni şifrenizi girin"
            className="w-full mb-4 p-4 text-base border border-gray-300 rounded-xl focus:outline-none pr-12"
            required
          />
          <button
            type="button"
            onClick={() => setPasswordVisible(!passwordVisible)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl text-gray-600"
          >
            {passwordVisible ? '👁️‍🗨️' : '👁️'}
          </button>
        </div>

        {/* Şifre Onay Alanı */}
        <div className="relative">
          <input
            type={confirmPasswordVisible ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Şifrenizi onaylayın"
            className="w-full mb-4 p-4 text-base border border-gray-300 rounded-xl focus:outline-none pr-12"
            required
          />
          <button
            type="button"
            onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl text-gray-600"
          >
            {confirmPasswordVisible ? '👁️‍🗨️' : '👁️'}
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-xl text-lg font-semibold hover:bg-blue-700 transition duration-200"
        >
          Şifreyi Sıfırla
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
