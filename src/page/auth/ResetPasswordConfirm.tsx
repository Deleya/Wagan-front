import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button, Input, Form, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { apiUrl, toUserMessage } from '../../config/api';

const ResetPasswordConfirm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { uid, token } = useParams<{ uid: string; token: string }>();

  const onFinish = async (values: { new_password: string; re_new_password: string }) => {
    if (values.new_password !== values.re_new_password) {
      return message.error('Les mots de passe ne correspondent pas.');
    }

    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/users/reset_password_confirm/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          token,
          new_password: values.new_password,
          re_new_password: values.re_new_password
        }),
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la réinitialisation. Le lien est peut-être expiré.');
      }

      message.success('Mot de passe réinitialisé avec succès !');
      navigate('/login');
    } catch (err: unknown) {
      message.error(toUserMessage(err, 'Erreur lors de la réinitialisation.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Nouveau mot de passe</h2>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Veuillez saisir votre nouveau mot de passe.
        </p>
        
        <Form name="reset_password_confirm" onFinish={onFinish} layout="vertical" className="mt-8">
          <Form.Item name="new_password" rules={[{ required: true, message: 'Veuillez saisir votre nouveau mot de passe !' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Nouveau mot de passe" size="large" />
          </Form.Item>

          <Form.Item name="re_new_password" rules={[{ required: true, message: 'Veuillez confirmer votre mot de passe !' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Confirmer le mot de passe" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="w-full bg-blue-600" size="large">
              Réinitialiser
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

export default ResetPasswordConfirm;
