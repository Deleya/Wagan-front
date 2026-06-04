import React, { useEffect, useState } from 'react';
import { Table, Button, message, Tag } from 'antd';
import { useAppSelector } from '../hooks/hooks';

const UsersList: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = useAppSelector((state) => state.auth.access);
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${base}/api/admin/users/`, {
        headers: { Authorization: `JWT ${token}` },
      });
      if (!res.ok) throw new Error('Erreur lors du chargement des utilisateurs');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const promoteAdmin = async (id: number) => {
    try {
      const res = await fetch(`${base}/api/admin/users/${id}/promote/`, {
        method: 'POST',
        headers: { 
          Authorization: `JWT ${token}`,
          'Content-Type': 'application/json'
        },
      });
      if (!res.ok) throw new Error('Erreur lors de la promotion');
      message.success('Utilisateur promu avec succès !');
      fetchUsers(); // Rafraichir la liste
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const openWhatsappSentimentDashboard = async () => {
    try {
      const res = await fetch(`${base}/api/admin/dashboard/session/`, {
        method: 'POST',
        headers: {
          Authorization: `JWT ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        throw new Error('Impossible d’ouvrir le dashboard whatsapp sentiment.');
      }
      const data = await res.json();
      window.open(data.url, '_blank');
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { 
      title: 'Rôle', 
      key: 'role', 
      render: (_: any, record: any) => (
        record.is_staff 
          ? <Tag color="gold">Admin</Tag> 
          : <Tag color="blue">User</Tag>
      )
    },
    { title: "Date d'inscription", dataIndex: 'date_joined', key: 'date_joined', render: (date: string) => new Date(date).toLocaleDateString() },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        !record.is_staff && (
          <Button type="primary" onClick={() => promoteAdmin(record.id)}>
            Promouvoir Admin
          </Button>
        )
      ),
    },
  ];

  return (
    <div className="p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold dark:text-white">Gestion des Utilisateurs</h2>
        <button
          onClick={openWhatsappSentimentDashboard}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          disabled={!token}
        >
          Ouvrir le dashboard Whatsapp Sentiment
        </button>
      </div>
      <Table 
        dataSource={users} 
        columns={columns} 
        rowKey="id" 
        loading={loading} 
        className="bg-white dark:bg-gray-800 rounded shadow"
      />
    </div>
  );
};

export default UsersList;
