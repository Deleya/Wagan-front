import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Form, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { apiUrl, toUserMessage } from '../../config/api';

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/users/reset_password/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        throw new Error("Impossible d'envoyer le lien de réinitialisation. Réessayez plus tard.");
      }

      message.success('Si cet email existe, un lien de réinitialisation vous a été envoyé.');
      navigate('/login');
    } catch (err: unknown) {
      message.error(toUserMessage(err, 'Erreur lors de la demande de réinitialisation.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Mot de passe oublié</h2>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Entrez votre adresse email pour recevoir un lien de réinitialisation.
        </p>
        
        <Form name="forgot_password" onFinish={onFinish} layout="vertical" className="mt-8">
          <Form.Item name="email" rules={[{ required: true, message: 'Veuillez saisir votre email !' }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="w-full bg-blue-600" size="large">
              Envoyer le lien
            </Button>
          </Form.Item>
        </Form>

        <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-4">
          <Link to="/login" className="text-blue-600 hover:underline">Retour à la connexion</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
