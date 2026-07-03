import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Form, message, Divider, Alert } from 'antd';
import { GoogleOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { apiUrl, toUserMessage } from '../../config/api';
import { startGoogleLogin } from './googleAuth';

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const onFinish = async (values: { email: string; password: string; password_confirm: string }) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(apiUrl('/api/auth/users/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email, password: values.password }),
      });

      if (!res.ok) {
        // Gestion des erreurs structurées Django/Djoser
        const errorData = await res.json().catch(() => ({}));
        let errMsg = 'Erreur lors de la création du compte.';

        if (errorData.email) {
          const e = Array.isArray(errorData.email) ? errorData.email[0] : errorData.email;
          errMsg = e.includes('already exists') ? 'Un compte avec cet email existe déjà.' : e;
        } else if (errorData.password) {
          const p = Array.isArray(errorData.password) ? errorData.password.join(' ') : errorData.password;
          errMsg = `Mot de passe invalide : ${p}`;
        } else if (errorData.non_field_errors) {
          errMsg = Array.isArray(errorData.non_field_errors)
            ? errorData.non_field_errors[0]
            : errorData.non_field_errors;
        }
        throw new Error(errMsg);
      }

      message.success('Inscription réussie ! Veuillez vous connecter.');
      navigate('/login');
    } catch (err: unknown) {
      setErrorMsg(toUserMessage(err, 'Erreur lors de la création du compte.'));
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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Inscription</h2>

        <Form name="register" onFinish={onFinish} layout="vertical" className="mt-8">
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

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Veuillez saisir votre email !' },
              { type: 'email', message: 'Format email invalide !' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Veuillez saisir votre mot de passe !' },
              { min: 8, message: 'Le mot de passe doit contenir au moins 8 caractères.' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mot de passe" size="large" />
          </Form.Item>

          <Form.Item
            name="password_confirm"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Veuillez confirmer votre mot de passe !' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Les deux mots de passe ne correspondent pas !'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirmer le mot de passe" size="large" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full bg-blue-600"
              size="large"
            >
              S'inscrire
            </Button>
          </Form.Item>
        </Form>

        <Divider className="dark:text-gray-400">OU</Divider>

        <Button icon={<GoogleOutlined />} onClick={handleGoogleLogin} className="w-full" size="large">
          S'inscrire avec Google
        </Button>

        <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-4">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
