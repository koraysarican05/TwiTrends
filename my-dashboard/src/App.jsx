// src/App.jsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "./context/Sidebarcontext";
import { DataProvider } from "./context/DataContext";
import { SearchProvider } from "./context/SearchContext";
import { UserProvider } from "./context/UserContext";   
import Layout from "./components/Layout";
import Dashboard from "./pages/dashboard";
import ReportsPage from "./pages/reports/ReportsPage";
import AccountPage from "./pages/account/AccountPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PrivateRoute from "./components/PrivateRoute";
import AdminPanel from "./pages/AdminPanel";

function App() {
  useEffect(() => {
    document.title = "TwiTrends Dashboard";
  }, []);

  return (
    <Router>
      <UserProvider>                   
        <DataProvider>
          <SearchProvider>
            <SidebarProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                {/* Protected Routes */}
                <Route element={<PrivateRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/admin-panel" element={<AdminPanel />} />
                    <Route index element={<Dashboard />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/account" element={<AccountPage />} />
                  </Route>
                </Route>
              </Routes>
            </SidebarProvider>
          </SearchProvider>
        </DataProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
