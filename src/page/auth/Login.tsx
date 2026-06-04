import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { setTokens, fetchUserProfile } from './authSlice';
import { useAppDispatch } from '../hooks/hooks';
import { Button, Input, Form, message, Divider, Alert } from 'antd';
import { GoogleOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextUrl = searchParams.get('next');

  const onFinish = async (values: any) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const base = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
      const res = await fetch(`${base}/api/auth/jwt/create/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        let errMsg = 'Email ou mot de passe incorrect';
        
        if (errorData.detail) {
          errMsg = errorData.detail;
          if (errorData.detail.includes('No active account found')) {
            errMsg = 'Email ou mot de passe incorrect';
          }
        } else if (errorData.non_field_errors) {
          const nonFieldErr = Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors[0] 
            : errorData.non_field_errors;
          errMsg = nonFieldErr;
          if (nonFieldErr.includes('No active account found')) {
            errMsg = 'Email ou mot de passe incorrect';
          }
        }
        throw new Error(errMsg);
      }

      const data = await res.json();
      dispatch(setTokens({ access: data.access, refresh: data.refresh }));
      const profile = await dispatch(fetchUserProfile()).unwrap();
      
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
        message.warning('Impossible d’ouvrir directement le dashboard admin, redirection vers /admin/dashboard.');
        navigate('/admin/dashboard');
      } else {
        message.success('Connexion réussie !');
        navigate('/chat');
      }
    } catch (err: any) {
      console.error('Erreur de connexion:', err);
      setErrorMsg(err.message || 'Impossible de se connecter au serveur backend');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const base = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
      const redirectUri = 'http://localhost:5173/auth/google';
      const res = await fetch(`${base}/api/auth/o/google-oauth2/?redirect_uri=${redirectUri}`);
      if (!res.ok) {
        throw new Error("Impossible de récupérer l'URL d'authentification Google");
      }
      const data = await res.json();
      window.location.href = data.authorization_url;
    } catch (err: any) {
      message.error(err.message || "Erreur d'initialisation de la connexion Google");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Connexion</h2>
        
        <Form name="login" onFinish={onFinish} layout="vertical" className="mt-8">
          {errorMsg && (
            <Alert
              message={errorMsg}
              type="error"
              showIcon
              closable
              onClose={() => setErrorMsg(null)}
              className="mb-4"
            />
          )}
          <Form.Item name="email" rules={[{ required: true, message: 'Veuillez saisir votre email !' }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'Veuillez saisir votre mot de passe !' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mot de passe" size="large" />
          </Form.Item>

          <div className="flex justify-end mb-4">
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="w-full bg-blue-600" size="large">
              Se connecter
            </Button>
          </Form.Item>
        </Form>

        <Divider className="dark:text-gray-400">OU</Divider>

        <Button icon={<GoogleOutlined />} onClick={handleGoogleLogin} className="w-full" size="large">
          Continuer avec Google
        </Button>

        <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-4">
          Pas encore de compte ? <Link to="/register" className="text-blue-600 hover:underline">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
