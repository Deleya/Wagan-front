import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { setTokens, fetchUserProfile } from './authSlice';
import { useAppDispatch } from '../hooks/hooks';
import { Button, Input, Form, message, Divider, Alert } from 'antd';
import { GoogleOutlined, MailOutlined, LockOutlined, HomeOutlined } from '@ant-design/icons';
import { apiUrl, toUserMessage } from '../../config/api';
import { startGoogleLogin } from './googleAuth';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // On n'accepte que des chemins internes (« /... ») pour éviter une redirection ouverte
  const rawNext = searchParams.get('next');
  const nextUrl = rawNext && rawNext.startsWith('/') ? rawNext : null;

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(apiUrl('/api/auth/jwt/create/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        let errMsg = 'Email ou mot de passe incorrect';
        if (errorData.detail) {
          errMsg = errorData.detail.includes('No active account found')
            ? 'Email ou mot de passe incorrect'
            : errorData.detail;
        } else if (errorData.non_field_errors) {
          const e = Array.isArray(errorData.non_field_errors)
            ? errorData.non_field_errors[0]
            : errorData.non_field_errors;
          errMsg = e.includes('No active account found') ? 'Email ou mot de passe incorrect' : e;
        }
        throw new Error(errMsg);
      }

      const data = await res.json();
      dispatch(setTokens({ access: data.access, refresh: data.refresh }));
      const profile = await dispatch(fetchUserProfile()).unwrap();

      if (profile.is_staff || profile.is_superuser) {
        message.success('Connexion Administrateur réussie !');
        navigate(nextUrl || '/admin/dashboard');
      } else {
        message.success('Connexion réussie !');
        navigate(nextUrl || '/chat');
      }
    } catch (err: unknown) {
      console.error('Erreur de connexion:', err);
      setErrorMsg(toUserMessage(err, 'Impossible de se connecter au serveur backend'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await startGoogleLogin();
    } catch (err: unknown) {
      message.error(toUserMessage(err, "Erreur d'initialisation de la connexion Google"));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      <Link to="/" className="absolute top-6 left-6 flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
        <HomeOutlined className="text-xl" />
      </Link>
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
