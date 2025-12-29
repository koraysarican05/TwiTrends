import React, { useState, useEffect } from "react";

const AccountPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.warn("Token bulunamadı.");
      return;
    }

    fetch("http://localhost:3001/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Yetkisiz erişim");
        return res.json();
      })
      .then((data) => {
        setName(data.full_name || "");
        setEmail(data.email || "");
      })
      .catch((err) => {
        console.error("Failed to fetch user info:", err);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email) {
      setMessage({ type: "error", text: "Please fill out required fields." });
      return;
    }

    if (password && password !== confirm) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      const response = await fetch("http://localhost:3001/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: name,
          email,
          password: password || undefined,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Account updated successfully!" });
        setPassword("");
        setConfirm("");
      } else {
        setMessage({ type: "error", text: result.error || "Update failed." });
      }
    } catch (err) {
      console.error("Update error:", err);
      setMessage({ type: "error", text: "An unexpected error occurred." });
    }

    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  return (
    <div className="min-h-screen flex items-start justify-center pt-16 px-4 sm:px-6 md:px-8 bg-transparent">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl bg-white/10 backdrop-blur-md border border-white/20 p-6 sm:p-10 rounded-2xl shadow-2xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-3 sm:mb-4">
          Account Management
        </h2>
        <p className="text-center text-white/70 mb-6 text-sm sm:text-base">
          You can view and update your account information from here
        </p>

        {message.text && (
          <div
            className={`mb-4 text-center text-sm px-4 py-2 rounded-md ${
              message.type === "error"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter Your Name and Surname"
            className="w-full bg-white/90 text-gray-800 px-4 py-3 rounded-md outline-none text-sm sm:text-base"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Enter Your Email Address"
            className="w-full bg-white/90 text-gray-800 px-4 py-3 rounded-md outline-none text-sm sm:text-base"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="relative">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Enter Your New Password"
              className="w-full bg-white/90 text-gray-800 px-4 py-3 pr-10 rounded-md outline-none text-sm sm:text-base"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 text-lg"
              onClick={() => setPasswordVisible((prev) => !prev)}
            >
              {passwordVisible ? "👁️‍🗨️" : "👁️"}
            </button>
          </div>

          <div className="relative">
            <input
              type={confirmVisible ? "text" : "password"}
              placeholder="Re-enter Your New Password"
              className="w-full bg-white/90 text-gray-800 px-4 py-3 pr-10 rounded-md outline-none text-sm sm:text-base"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 text-lg"
              onClick={() => setConfirmVisible((prev) => !prev)}
            >
              {confirmVisible ? "👁️‍🗨️" : "👁️"}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition"
            >
              Save
            </button>

            <button
              type="button"
              className="w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition"
              onClick={() => {
                setName("");
                setEmail("");
                setPassword("");
                setConfirm("");
                setMessage({ type: "", text: "" });
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountPage;
