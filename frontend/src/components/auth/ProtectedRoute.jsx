import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useStore from '../../store/useStore';

export default function ProtectedRoute() {
  const { token, selectedCompany } = useStore();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, but no company selected, and not trying to select/create one
  const allowedWithoutCompany = ['/select-company', '/company'];
  if (!selectedCompany && !allowedWithoutCompany.some(path => location.pathname.startsWith(path))) {
    return <Navigate to="/select-company" replace />;
  }

  return <Outlet />;
}
