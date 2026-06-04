import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Form, message, Divider } from 'antd';
import { GoogleOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const base = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
      const res = await fetch(`${base}/api/auth/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la création du compte');
      }

      message.success('Inscription réussie ! Veuillez vous connecter.');
      navigate('/login');
    } catch (err: any) {
      message.error(err.message);
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
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Inscription</h2>
        
        <Form name="register" onFinish={onFinish} layout="vertical" className="mt-8">
          <Form.Item name="email" rules={[{ required: true, message: 'Veuillez saisir votre email !' }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'Veuillez saisir votre mot de passe !' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mot de passe" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="w-full bg-blue-600" size="large">
              S'inscrire
            </Button>
          </Form.Item>
        </Form>

        <Divider className="dark:text-gray-400">OU</Divider>

        <Button icon={<GoogleOutlined />} onClick={handleGoogleLogin} className="w-full" size="large">
          S'inscrire avec Google
        </Button>

        <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-4">
          Déjà un compte ? <Link to="/login" className="text-blue-600 hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
