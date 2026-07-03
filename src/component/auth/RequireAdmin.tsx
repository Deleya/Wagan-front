import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../page/hooks/hooks';
import { useEffect } from 'react';
import { fetchUserProfile } from '../../page/auth/authSlice';

const RequireAdmin = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { isAuthenticated, isAdmin, user, status } = useAppSelector((state) => state.auth);

  // Si on est authentifié (token présent) mais qu'on a perdu les infos de l'utilisateur 
  // (à cause d'un rafraichissement de page), on les récupère silencieusement.
  useEffect(() => {
    if (isAuthenticated && !user && status === 'idle') {
      dispatch(fetchUserProfile());
    }
  }, [isAuthenticated, user, status, dispatch]);

  if (!isAuthenticated) {
    // ?next= permet à Login de renvoyer l'utilisateur vers la page demandée
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Pendant le chargement du profil, on affiche un écran d'attente
  if (status === 'loading' || (status === 'idle' && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <p className="text-slate-500 font-medium mt-4">Vérification de vos accès administrateur...</p>
        </div>
      </div>
    );
  }

  // Si le chargement est fini et que l'utilisateur n'est pas admin, on le dégage vers le chat
  if (!isAdmin) {
    return <Navigate to="/chat" replace />;
  }

  return <Outlet />;
};

export default RequireAdmin;
