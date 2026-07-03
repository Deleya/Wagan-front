import React, { useEffect, useState } from 'react';
import { Table, Button, message, Tag, Space, Popconfirm, ConfigProvider, theme, Input } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAppSelector } from '../hooks/hooks';
import type { User } from '../auth/authSlice';
import { apiUrl, authHeader, toUserMessage } from '../../config/api';

interface UsersListProps {
  isDark?: boolean;
}

const UsersList: React.FC<UsersListProps> = ({ isDark = false }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const token = useAppSelector((state) => state.auth.access);
  const currentUser = useAppSelector((state) => state.auth.user);

  const isSuperAdmin = currentUser?.is_superuser;
  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchEmail.trim().toLowerCase())
  );
  const colors = isDark ? {
    surface: '#1e293b',
    surfaceSoft: '#243247',
    border: '#334155',
    heading: '#f8fafc',
    text: '#e2e8f0',
    muted: '#94a3b8',
    badgeBg: '#312e81',
    badgeText: '#c7d2fe',
  } : {
    surface: '#ffffff',
    surfaceSoft: '#f8fafc',
    border: '#e2e8f0',
    heading: '#0f172a',
    text: '#334155',
    muted: '#64748b',
    badgeBg: '#fce7f3',
    badgeText: '#be185d',
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/admin/users/'), {
        headers: authHeader(token),
      });
      if (!res.ok) throw new Error('Erreur lors du chargement des utilisateurs');
      const data = await res.json();
      setUsers(data);
    } catch (err: unknown) {
      message.error(toUserMessage(err, 'Erreur lors du chargement des utilisateurs'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const promoteAdmin = async (id: number) => {
    try {
      const res = await fetch(apiUrl(`/api/admin/users/${id}/promote/`), {
        method: 'POST',
        headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Erreur lors de la promotion');
      }
      message.success('Utilisateur promu Admin avec succes !');
      fetchUsers();
    } catch (err: unknown) {
      message.error(toUserMessage(err, 'Erreur lors de la promotion'));
    }
  };

  const revokeAdmin = async (id: number) => {
    try {
      const res = await fetch(apiUrl(`/api/admin/users/${id}/revoke/`), {
        method: 'POST',
        headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Erreur lors de la revocation');
      }
      message.success('Administrateur retrograde au rang de User !');
      fetchUsers();
    } catch (err: unknown) {
      message.error(toUserMessage(err, 'Erreur lors de la revocation'));
    }
  };

  const transferSuperAdmin = async (id: number) => {
    try {
      const res = await fetch(apiUrl(`/api/admin/users/${id}/transfer-superadmin/`), {
        method: 'POST',
        headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Erreur lors du transfert');
      }
      message.success('Role Super Admin transfere definitivement !');
      fetchUsers();
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: unknown) {
      message.error(toUserMessage(err, 'Erreur lors du transfert'));
    }
  };

  const deleteUser = async (id: number) => {
    try {
      const res = await fetch(apiUrl(`/api/admin/users/${id}/delete/`), {
        method: 'DELETE',
        headers: authHeader(token),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Erreur lors de la suppression');
      }
      message.success('Utilisateur supprimé avec succès.');
      fetchUsers();
    } catch (err: unknown) {
      message.error(toUserMessage(err, 'Erreur lors de la suppression'));
    }
  };

  const columns: ColumnsType<User> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Role',
      key: 'role',
      render: (_: unknown, record: User) => {
        if (record.is_superuser) return <Tag color="magenta">Super Admin</Tag>;
        if (record.is_staff) return <Tag color="gold">Admin</Tag>;
        return <Tag color="blue">User</Tag>;
      },
    },
    {
      title: "Date d'inscription",
      dataIndex: 'date_joined',
      key: 'date_joined',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: User) => (
        <Space wrap>
          {isSuperAdmin && !record.is_staff && (
            <Button type="primary" size="middle" onClick={() => promoteAdmin(record.id)}>
              Promouvoir Admin
            </Button>
          )}

          {isSuperAdmin && record.is_staff && !record.is_superuser && (
            <Popconfirm title="Revoquer les droits d'administration de cet utilisateur ?" onConfirm={() => revokeAdmin(record.id)}>
              <Button danger size="middle">Revoquer</Button>
            </Popconfirm>
          )}

          {isSuperAdmin && !record.is_superuser && record.is_staff && (
            <Popconfirm
              title="Transferer le role Super Admin ?"
              description="Vous perdrez ce privilege immediatement. Proceder ?"
              onConfirm={() => transferSuperAdmin(record.id)}
            >
              <Button type="dashed" danger size="middle">Leguer Super Admin</Button>
            </Popconfirm>
          )}

          {/* Règle métier : Seuls les admins ou super admins peuvent voir ce bouton. 
              On ne peut supprimer que les simples utilisateurs (ni staff, ni superuser).
              L'admin ne peut pas se supprimer lui-même. */}
          {!record.is_staff && !record.is_superuser && currentUser?.id !== record.id && (
            <Popconfirm
              title="Supprimer cet utilisateur ?"
              description="Cette action est irréversible. Confirmer ?"
              onConfirm={() => deleteUser(record.id)}
            >
              <Button type="primary" danger size="middle" icon={<DeleteOutlined />}>
                Supprimer
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider theme={{ algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
      <div className="w-full" style={{ backgroundColor: colors.surface, color: colors.text }}>
        <div
          className="px-6 py-5 flex justify-between items-center gap-4"
          style={{ borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.surface }}
        >
          <div>
            <h3 className="font-semibold" style={{ color: colors.heading, fontSize: 20, margin: 0 }}>
              Liste des Utilisateurs Inscrits
            </h3>
            <p style={{ color: colors.muted, fontSize: 14, margin: '6px 0 0' }}>
              Comptes autorises a utiliser l'espace admin
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Input.Search
              allowClear
              placeholder="Rechercher une adresse email"
              value={searchEmail}
              onChange={(event) => setSearchEmail(event.target.value)}
              style={{ width: 280 }}
            />
            {isSuperAdmin ? (
              <span
                className="px-3 py-1.5 rounded-full font-bold uppercase tracking-wider"
                style={{ fontSize: 12, backgroundColor: colors.badgeBg, color: colors.badgeText }}
              >
                Mode Super Admin
              </span>
            ) : (
              <span
                className="px-3 py-1.5 rounded-full font-bold uppercase tracking-wider"
                style={{ fontSize: 12, backgroundColor: colors.surfaceSoft, color: colors.text }}
              >
                Connecte: {currentUser?.email} (Admin Normal)
              </span>
            )}
          </div>
        </div>
        <div className="p-4" style={{ backgroundColor: colors.surface }}>
          <Table
            dataSource={filteredUsers}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 5 }}
            size="middle"
          />
        </div>
      </div>
    </ConfigProvider>
  );
};

export default UsersList;
