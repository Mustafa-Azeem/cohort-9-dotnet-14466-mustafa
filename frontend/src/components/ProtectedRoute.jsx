import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// wraps pages that need login - kicks you to /login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
