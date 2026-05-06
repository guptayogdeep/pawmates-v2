import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading, pets } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (pets.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
