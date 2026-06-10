import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { BarChart3, LogOut, MessageCircle, PanelLeftClose, PanelLeftOpen, Users } from 'lucide-react';
import UsersList from './UsersList';
import { logout } from '../auth/authSlice';
import { useAppDispatch } from '../hooks/hooks';
import { DatePicker, ConfigProvider, theme } from 'antd';

const { RangePicker } = DatePicker;

ChartJS.register(ArcElement, Tooltip, Legend);

type ActiveView = 'analyse' | 'prospects' | 'users';

interface Prospect {
  phone?: string;
  sentiment?: string;
  avg_score?: number;
  nb_messages?: number;
  last_contact?: string;
  first_contact?: string;
  statut?: string;
}

interface DashboardData {
  total: number;
  utilisateurs: number;
  positifs: number;
  neutres: number;
  negatifs: number;
  pending: number;
  p_positif: number;
  p_neutre: number;
  p_negatif: number;
  now: string;
  prospects_list?: Prospect[];
  taux_conversion?: number;
  nb_prospects_convertis?: number;
  avg_messages_to_convert?: number | null;
}

const base = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('analyse');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('access');
        let url = `${base}/whatsapp/dashboard/api/`;
        if (dateRange) {
          url += `?start_date=${dateRange[0]}&end_date=${dateRange[1]}`;
        }
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) throw new Error("Erreur lors de la recuperation des donnees");
        setData(await response.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dateRange]);

  const colors = isDark ? {
    page: 'bg-[#0B1120] text-slate-100',
    panel: 'bg-[#1e293b]/70 backdrop-blur-3xl border-[#334155] shadow-2xl shadow-black/40',
    soft: 'bg-slate-800/40',
    text: 'text-slate-100',
    muted: 'text-slate-400',
    border: 'border-[#334155]',
    hover: 'hover:bg-slate-800/80 transition-colors',
    rowHover: 'hover:bg-slate-800/30 transition-colors duration-200',
  } : {
    page: 'bg-[#f8fafc] text-slate-800',
    panel: 'bg-white border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
    soft: 'bg-slate-50',
    text: 'text-slate-800',
    muted: 'text-slate-500',
    border: 'border-slate-100',
    hover: 'hover:bg-slate-50 transition-colors',
    rowHover: 'hover:bg-slate-50/50 transition-colors duration-200',
  };

  const prospects = data?.prospects_list ?? [];

  const chartData = useMemo(() => {
    const hasData = !!data && data.utilisateurs > 0;
    return {
      labels: hasData
        ? ['Prospects Chauds', 'Prospects Froids', 'Alertes Humaines', ...(data.pending > 0 ? ['En attente'] : [])]
        : ['Aucune donnee'],
      datasets: [{
        data: hasData
          ? [data.positifs, data.neutres, data.negatifs, ...(data.pending > 0 ? [data.pending] : [])]
          : [1],
        backgroundColor: hasData
          ? ['#10b981', '#94a3b8', '#f43f5e', ...(data.pending > 0 ? ['#fbbf24'] : [])]
          : ['#cbd5e1'],
        borderWidth: 0,
        hoverOffset: 4,
      }],
    };
  }, [data]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '78%',
    plugins: { legend: { display: false } },
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (loading) {
    return <div className={`min-h-screen p-8 text-center ${colors.page}`}>Chargement des donnees CRM...</div>;
  }

  if (error) {
    return <div className={`min-h-screen p-8 text-center text-red-500 ${colors.page}`}>Erreur: {error}</div>;
  }

  if (!data) return null;

  const navItems = [
    { key: 'analyse' as const, label: 'Analyse', icon: BarChart3 },
    { key: 'prospects' as const, label: 'Prospects', icon: MessageCircle },
    { key: 'users' as const, label: 'Utilisateurs', icon: Users },
  ];

  return (
    <div className={`admin-dashboard min-h-screen font-sans antialiased transition-colors duration-500 ${colors.page}`}>
      <div className="flex min-h-screen relative selection:bg-teal-500/30">
        <aside
          className={`shrink-0 border-r z-20 sticky top-0 h-screen ${colors.panel} transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'w-[300px]' : 'w-[88px]'
          }`}
        >
          <div className="h-full flex flex-col py-6">
            <div className="flex items-center justify-between px-6 pb-6 mb-4 border-b border-inherit">
              {sidebarOpen && (
                <div>
                  <p className="text-base font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-emerald-600">WAGAN CRM</p>
                  <p className={`text-[11px] font-medium tracking-widest mt-1 ${colors.muted}`}>WORK.BAKETLI</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => setSidebarOpen((value) => !value)}
                className={`h-10 w-10 inline-flex items-center justify-center rounded-xl ${colors.hover}`}
                aria-label={sidebarOpen ? 'Replier la sidebar' : 'Ouvrir la sidebar'}
              >
                {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
              </button>
            </div>

            <nav className="flex-1 px-4 space-y-3">
              {navItems.map(({ key, label, icon: Icon }) => {
                const active = activeView === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveView(key)}
                    className={`w-full h-14 rounded-2xl flex items-center gap-4 px-5 text-[15px] font-bold transition-all duration-300 ${
                      active ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-500/20 translate-x-1' : `${colors.hover} ${colors.muted} hover:translate-x-1`
                    }`}
                    title={!sidebarOpen ? label : undefined}
                  >
                    <Icon size={20} className={`shrink-0 ${active ? 'animate-pulse' : ''}`} />
                    {sidebarOpen && <span className="tracking-wide">{label}</span>}
                  </button>
                );
              })}
            </nav>

            {sidebarOpen && (
              <div className={`p-4 text-xs ${colors.muted}`}>
                Derniere synchronisation
                <div className={colors.text}>
                  {new Date(data.now).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 min-w-0 p-8 lg:p-12 xl:max-w-7xl mx-auto w-full">
          <header className={`flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-8 rounded-[32px] border ${colors.panel} mb-12`}>
            <div>
              <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-emerald-700">
                {activeView === 'analyse' ? 'Analyse & Insights' : activeView === 'prospects' ? 'Base Prospects' : 'Utilisateurs Inscrits'}
              </h1>
              <p className={`text-[15px] mt-2 font-medium ${colors.muted}`}>Tableau de bord de gestion et d'intelligence artificielle</p>
            </div>
            <div className="flex items-center gap-8">
              
              {/* Toggle Switch Light/Dark */}
              <div className="flex items-center gap-3">
                <span className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${isDark ? colors.muted : colors.text}`}>Light</span>
                <button
                  type="button"
                  onClick={() => setIsDark(!isDark)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${isDark ? 'bg-teal-500' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${isDark ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${isDark ? colors.text : colors.muted}`}>Dark</span>
              </div>

              <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>

              <button
                type="button"
                onClick={handleLogout}
                className="px-6 py-3 rounded-2xl text-[14px] font-bold bg-gradient-to-r from-rose-500 to-red-600 text-white hover:from-rose-600 hover:to-red-700 shadow-lg shadow-rose-500/20 transition-all duration-300 inline-flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                <LogOut size={18} strokeWidth={2.5} />
                Déconnexion
              </button>
            </div>
          </header>

          {activeView === 'analyse' && (
            <section className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                <KpiCard title="Volume de Messages" value={data.total} colors={colors} />
                <KpiCard title="Clients Uniques" value={data.utilisateurs} colors={colors} />
                <KpiCard title="Taux de conversion" value={`${data.taux_conversion ?? 0}%`} subtitle={`${data.nb_prospects_convertis ?? 0} converti(s) sur ${data.utilisateurs}`} colors={colors} />
                <KpiCard title="Msgs avant conversion" value={data.avg_messages_to_convert ?? 'Pas assez'} colors={colors} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-8">
                <div className={`rounded-[32px] border p-10 ${colors.panel}`}>
                  <div className="flex items-center gap-4 mb-10">
                    <div className="p-3.5 bg-teal-500/10 rounded-2xl">
                      <BarChart3 className="text-teal-500" size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 dark:text-white">Qualification des Prospects</h2>
                      <p className={`text-[15px] mt-1.5 ${colors.muted}`}>Répartition par intelligence artificielle.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <LegendRow label="Prospects Chauds" value={`${data.positifs} (${data.p_positif}%)`} color="bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-emerald-500/30" />
                    <LegendRow label="Prospects Froids" value={`${data.neutres} (${data.p_neutre}%)`} color="bg-gradient-to-r from-slate-400 to-slate-500 shadow-slate-500/30" />
                    <LegendRow label="Alertes Humaines" value={`${data.negatifs} (${data.p_negatif}%)`} color="bg-gradient-to-r from-rose-400 to-rose-500 shadow-rose-500/30" />
                    {data.pending > 0 && <LegendRow label="En attente" value={data.pending} color="bg-gradient-to-r from-amber-400 to-amber-500 shadow-amber-500/30" />}
                  </div>
                </div>

                <div className={`rounded-[32px] border p-10 flex items-center justify-center ${colors.panel}`}>
                  <div className="relative w-full max-w-[300px] aspect-square">
                    <Doughnut data={chartData} options={chartOptions} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                      <span className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-100 dark:to-slate-300 drop-shadow-sm">{data.utilisateurs}</span>
                      <span className={`text-[13px] font-bold uppercase tracking-[0.2em] mt-2 ${colors.muted}`}>Clients</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeView === 'prospects' && (
            <section className={`rounded-[32px] border overflow-hidden ${colors.panel} shadow-lg shadow-slate-200/20 dark:shadow-none`}>
              <div className={`p-8 border-b ${colors.border} flex flex-col sm:flex-row justify-between items-center gap-6 bg-slate-50/50 dark:bg-slate-900/50`}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 rounded-xl">
                    <MessageCircle className="text-indigo-500" size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white">Base Prospects</h2>
                </div>
                <ConfigProvider theme={{ algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
                  <RangePicker
                    onChange={(dates) => {
                      if (dates && dates[0] && dates[1]) {
                        setDateRange([dates[0].toISOString(), dates[1].toISOString()]);
                      } else {
                        setDateRange(null);
                      }
                    }}
                  />
                </ConfigProvider>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className={`${colors.soft} border-b ${colors.border}`}>
                    <tr>
                      <th className="px-8 py-5 text-left font-bold uppercase tracking-widest text-[12px] text-slate-400">Numéro</th>
                      <th className="px-8 py-5 text-left font-bold uppercase tracking-widest text-[12px] text-slate-400">Statut IA</th>
                      <th className="px-8 py-5 text-left font-bold uppercase tracking-widest text-[12px] text-slate-400">Messages</th>
                      <th className="px-8 py-5 text-left font-bold uppercase tracking-widest text-[12px] text-slate-400">Dernier message</th>
                      <th className="px-8 py-5 text-left font-bold uppercase tracking-widest text-[12px] text-slate-400">Premier contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {prospects.length === 0 ? (
                      <tr>
                        <td colSpan={5} className={`px-8 py-16 text-center text-lg ${colors.muted}`}>Aucun prospect dans cette période.</td>
                      </tr>
                    ) : prospects.map((prospect, index) => (
                      <tr key={`${prospect.phone ?? 'prospect'}-${index}`} className={`${colors.rowHover} group cursor-default`}>
                        <td className="px-8 py-6 font-bold text-[15px]">{prospect.phone ?? '-'}</td>
                        <td className="px-8 py-6">
                          <span className={`px-4 py-2 rounded-full text-[13px] font-bold inline-flex items-center gap-2 shadow-sm ${
                            prospect.statut === 'Chaud' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 
                            prospect.statut === 'Alerte' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${
                              prospect.statut === 'Chaud' ? 'bg-emerald-500' : prospect.statut === 'Alerte' ? 'bg-rose-500' : 'bg-slate-500'
                            }`}></span>
                            {prospect.statut ?? prospect.sentiment ?? '-'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[14px]">
                              {prospect.nb_messages ?? '-'}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 max-w-[250px] truncate text-slate-500 font-medium text-[15px]">{formatDate(prospect.last_contact)}</td>
                        <td className="px-8 py-6 text-slate-500 font-medium text-[15px]">{formatDate(prospect.first_contact)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeView === 'users' && (
            <section className={`rounded-[32px] border overflow-hidden ${colors.panel}`}>
              <UsersList isDark={isDark} />
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

function KpiCard({ title, value, subtitle, colors }: { title: string; value: React.ReactNode; subtitle?: string; colors: any }) {
  return (
    <div className={`relative overflow-hidden rounded-[28px] border p-8 ${colors.panel} hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 group`}>
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <p className={`text-[13px] font-bold uppercase tracking-[0.2em] ${colors.muted}`}>{title}</p>
      <div className="mt-6 text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-100 dark:to-slate-300 drop-shadow-sm">{value}</div>
      {subtitle && <p className={`mt-4 text-[15px] font-medium ${colors.muted}`}>{subtitle}</p>}
    </div>
  );
}

function LegendRow({ label, value, color }: { label: string; value: React.ReactNode; color: string }) {
  return (
    <div className={`flex items-center justify-between gap-4 p-4 rounded-2xl transition-colors duration-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50`}>
      <div className="flex items-center gap-4">
        <span className={`w-4 h-4 rounded-full shadow-sm ${color}`} />
        <span className="font-bold text-[15px]">{label}</span>
      </div>
      <span className="font-black bg-slate-100 dark:bg-slate-800/80 px-4 py-1.5 rounded-xl text-[15px]">{value}</span>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default AdminDashboard;
