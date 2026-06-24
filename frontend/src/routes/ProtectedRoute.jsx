import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles, isAuthenticated, user, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
