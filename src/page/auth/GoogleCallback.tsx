import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../hooks/hooks';
import { setTokens, fetchUserProfile } from './authSlice';
import { Spin, Alert, Button, message } from 'antd';

/**
 * Ce composant reçoit les tokens JWT directement dans l'URL query params,
 * car le callback Google est maintenant géré côté backend Django.
 * 
 * Flux :
 * 1. Login.tsx → GET /api/auth/o/google-oauth2/?redirect_uri=http://localhost:8000/api/auth/google/callback/
 * 2. Utilisateur s'authentifie sur Google
 * 3. Google → GET http://localhost:8000/api/auth/google/callback/?code=...
 * 4. Django échange le code, génère JWT, redirige vers :
 *    http://localhost:5173/auth/google?access=TOKEN&refresh=TOKEN
 * 5. Ce composant lit access + refresh depuis l'URL
 */
const GoogleCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const access = searchParams.get('access');
    const refresh = searchParams.get('refresh');
    const error = searchParams.get('error');

    const handleCallback = async () => {
      try {
        // Cas d'erreur renvoyée par le backend Django
        if (error) {
          const errorMessages: Record<string, string> = {
            access_denied: "Accès refusé par Google.",
            token_exchange_failed: "Impossible d'échanger le code Google. Vérifiez vos clés API.",
            userinfo_failed: "Impossible de récupérer votre profil Google.",
            no_email: "Votre compte Google ne fournit pas d'adresse email.",
            network_error: "Erreur réseau lors de la connexion Google.",
            server_error: "Erreur serveur. Veuillez réessayer.",
          };
          throw new Error(errorMessages[error] || `Erreur: ${error}`);
        }

        // Cas normal : tokens reçus depuis Django
        if (!access || !refresh) {
          throw new Error("Paramètres de connexion manquants (tokens absents).");
        }

        // Stocker les tokens et charger le profil
        dispatch(setTokens({ access, refresh }));
        const profile = await dispatch(fetchUserProfile()).unwrap();

        setLoading(false);

        if (profile.is_staff || profile.is_superuser) {
          message.success('Connexion Administrateur réussie !');
          navigate('/admin/dashboard');
        } else {
          message.success('Connexion Google réussie !');
          navigate('/chat');
        }
      } catch (err: any) {
        console.error('Erreur Callback Google:', err);
        setErrorMsg(err.message || 'Une erreur est survenue lors de la connexion avec Google');
        setLoading(false);
      }
    };

    handleCallback();
  }, []); // volontairement sans deps pour éviter le double appel React StrictMode

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl text-center">
        {loading && (
          <>
            <Spin size="large" />
            <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
              Connexion avec Google en cours...
            </p>
          </>
        )}

        {errorMsg && (
          <div className="space-y-4">
            <Alert
              message="Échec de l'authentification Google"
              description={errorMsg}
              type="error"
              showIcon
            />
            <Button type="primary" className="w-full mt-4 bg-blue-600" onClick={() => navigate('/login')}>
              Retourner à la page de connexion
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleCallback;
