import { Navigate, Outlet, useLocation } from "react-router-dom";

const PrivateRoute = () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const role = localStorage.getItem("role") || sessionStorage.getItem("role");
  const location = useLocation();

  
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  
  if (location.pathname.startsWith("/admin") && role !== "admin") {
    return <Navigate to="/" replace />;
  }

  
  return <Outlet />;
};

export default PrivateRoute;
