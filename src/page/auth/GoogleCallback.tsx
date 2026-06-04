import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../hooks/hooks';
import { setTokens, fetchUserProfile } from './authSlice';
import { Spin, Alert, Button, message } from 'antd';

const GoogleCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const nextUrl = searchParams.get('next');

    if (code && state) {
      const loginWithGoogle = async () => {
        try {
          const base = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
          
          const res = await fetch(`${base}/api/auth/o/google-oauth2/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              code,
              state,
            }).toString(),
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.detail || 'Erreur lors de la connexion Google. Vérifiez que votre secret client est correct dans le fichier .env.');
          }

          const data = await res.json();
          
          dispatch(setTokens({ access: data.access, refresh: data.refresh }));
          const profile = await dispatch(fetchUserProfile()).unwrap();
          
          setLoading(false);
          if (profile.is_staff || profile.is_superuser) {
            message.success('Connexion Administrateur réussie !');
            if (nextUrl && nextUrl.startsWith('http')) {
              window.location.href = nextUrl;
              return;
            }
            const bridgeRes = await fetch(`${base}/api/admin/dashboard/session/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${data.access}`,
              },
            });
            if (bridgeRes.ok) {
              const bridgeData = await bridgeRes.json();
              window.location.href = bridgeData.url;
              return;
            }
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

      loginWithGoogle();
    } else {
      setErrorMsg('Paramètres de connexion Google manquants (code ou state absent)');
      setLoading(false);
    }
  }, [searchParams, dispatch, navigate]);

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
