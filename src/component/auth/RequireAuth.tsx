import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../page/hooks/hooks';

const RequireAuth = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // ?next= permet à Login de renvoyer l'utilisateur vers la page demandée
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
