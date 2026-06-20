import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  requiredRole?: 'admin';
}

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return <Navigate to="/acceso-denegado" replace />;
  }

  return <Outlet />;
}
