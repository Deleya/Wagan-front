import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { BarChart3, LogOut, MessageCircle, PanelLeftClose, PanelLeftOpen, Settings, Users } from 'lucide-react';
import UsersList from './UsersList';
import BotConfigPanel from './BotConfigPanel';
import { logout } from '../auth/authSlice';
import { useAppDispatch } from '../hooks/hooks';
import { DatePicker, ConfigProvider, theme } from 'antd';

const { RangePicker } = DatePicker;

ChartJS.register(ArcElement, Tooltip, Legend);

type ActiveView = 'analyse' | 'prospects' | 'users' | 'config';

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
    page: 'bg-slate-950 text-slate-100',
    panel: 'bg-slate-900 border-slate-800 shadow-sm',
    soft: 'bg-slate-800/50',
    text: 'text-slate-100',
    muted: 'text-slate-400',
    border: 'border-slate-800',
    hover: 'hover:bg-slate-800 transition-colors',
    rowHover: 'hover:bg-slate-800/50 transition-colors',
    badgeBg: 'bg-slate-800',
  } : {
    page: 'bg-slate-50 text-slate-900',
    panel: 'bg-white border-slate-200 shadow-sm',
    soft: 'bg-slate-50',
    text: 'text-slate-900',
    muted: 'text-slate-500',
    border: 'border-slate-200',
    hover: 'hover:bg-slate-100 transition-colors',
    rowHover: 'hover:bg-slate-50 transition-colors',
    badgeBg: 'bg-slate-100',
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
    { key: 'config' as const, label: 'Configuration', icon: Settings },
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
                  <p className={`text-base font-extrabold tracking-wider ${colors.text}`}>WAGAN CRM</p>
                  <p className={`text-[11px] font-semibold tracking-widest mt-1 ${colors.muted}`}>WORK.BAKETLI</p>
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
                    className={`w-full h-12 rounded-xl flex items-center gap-4 px-4 text-[14px] font-semibold transition-all duration-200 ${
                      active ? (isDark ? 'bg-teal-500 text-white' : 'bg-slate-900 text-white') + ' shadow-sm' : `${colors.hover} ${colors.text}`
                    }`}
                    title={!sidebarOpen ? label : undefined}
                  >
                    <Icon size={18} className="shrink-0" />
                    {sidebarOpen && <span>{label}</span>}
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
          <header className={`flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-8 rounded-2xl border ${colors.panel} mb-8`}>
            <div>
              <h1 className={`text-3xl font-extrabold tracking-tight ${colors.text}`}>
                {activeView === 'analyse' ? 'Analyse & Insights'
                  : activeView === 'prospects' ? 'Base Prospects'
                  : activeView === 'config' ? 'Configuration du Chatbot'
                  : 'Utilisateurs Inscrits'}
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

              <div className={`w-px h-8 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>

              <button
                type="button"
                onClick={handleLogout}
                className="px-5 py-2.5 rounded-xl text-[14px] font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all inline-flex items-center gap-2"
              >
                <LogOut size={16} strokeWidth={2} />
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
                <div className={`rounded-2xl border p-8 ${colors.panel}`}>
                  <div className="flex items-center gap-4 mb-8">
                    <div className={`p-3 rounded-xl ${colors.badgeBg}`}>
                      <BarChart3 className={colors.text} size={24} />
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${colors.text}`}>Qualification des Prospects</h2>
                      <p className={`text-sm mt-1 ${colors.muted}`}>Répartition par intelligence artificielle.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <LegendRow label="Prospects Chauds" value={`${data.positifs} (${data.p_positif}%)`} color="bg-emerald-500" colors={colors} />
                    <LegendRow label="Prospects Froids" value={`${data.neutres} (${data.p_neutre}%)`} color="bg-slate-500" colors={colors} />
                    <LegendRow label="Alertes Humaines" value={`${data.negatifs} (${data.p_negatif}%)`} color="bg-rose-500" colors={colors} />
                    {data.pending > 0 && <LegendRow label="En attente" value={data.pending} color="bg-amber-500" colors={colors} />}
                  </div>
                </div>

                <div className={`rounded-2xl border p-8 flex items-center justify-center ${colors.panel}`}>
                  <div className="relative w-full max-w-[280px] aspect-square">
                    <Doughnut data={chartData} options={chartOptions} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                      <span className={`text-5xl font-black ${colors.text}`}>{data.utilisateurs}</span>
                      <span className={`text-[12px] font-bold uppercase tracking-widest mt-1 ${colors.muted}`}>Clients</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeView === 'prospects' && (
            <section className={`rounded-2xl border overflow-hidden ${colors.panel}`}>
              <div className={`p-6 border-b ${colors.border} flex flex-col sm:flex-row justify-between items-center gap-6 ${colors.soft}`}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${colors.badgeBg}`}>
                    <MessageCircle className={colors.text} size={20} />
                  </div>
                  <h2 className={`text-xl font-bold ${colors.text}`}>Base Prospects</h2>
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
                      <th className={`px-6 py-4 text-left font-semibold uppercase tracking-wider text-[12px] ${colors.muted}`}>Numéro</th>
                      <th className={`px-6 py-4 text-left font-semibold uppercase tracking-wider text-[12px] ${colors.muted}`}>Statut IA</th>
                      <th className={`px-6 py-4 text-left font-semibold uppercase tracking-wider text-[12px] ${colors.muted}`}>Messages</th>
                      <th className={`px-6 py-4 text-left font-semibold uppercase tracking-wider text-[12px] ${colors.muted}`}>Dernier message</th>
                      <th className={`px-6 py-4 text-left font-semibold uppercase tracking-wider text-[12px] ${colors.muted}`}>Premier contact</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                    {prospects.length === 0 ? (
                      <tr>
                        <td colSpan={5} className={`px-6 py-12 text-center text-sm ${colors.muted}`}>Aucun prospect dans cette période.</td>
                      </tr>
                    ) : prospects.map((prospect, index) => (
                      <tr key={`${prospect.phone ?? 'prospect'}-${index}`} className={`${colors.rowHover} group cursor-default`}>
                        <td className={`px-6 py-4 font-semibold text-[14px] ${colors.text}`}>{prospect.phone ?? '-'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[12px] font-semibold inline-flex items-center gap-1.5 ${
                            prospect.statut === 'Chaud' ? (isDark ? 'bg-emerald-900 text-emerald-300' : 'bg-emerald-100 text-emerald-700') : 
                            prospect.statut === 'Alerte' ? (isDark ? 'bg-rose-900 text-rose-300' : 'bg-rose-100 text-rose-700') : (isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700')
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              prospect.statut === 'Chaud' ? 'bg-emerald-500' : prospect.statut === 'Alerte' ? 'bg-rose-500' : 'bg-slate-500'
                            }`}></span>
                            {prospect.statut ?? prospect.sentiment ?? '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-medium ${colors.text}`}>{prospect.nb_messages ?? '-'}</span>
                        </td>
                        <td className={`px-6 py-4 max-w-[200px] truncate ${colors.muted} font-medium text-[14px]`}>{formatDate(prospect.last_contact)}</td>
                        <td className={`px-6 py-4 ${colors.muted} font-medium text-[14px]`}>{formatDate(prospect.first_contact)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeView === 'users' && (
            <section className={`rounded-2xl border overflow-hidden ${colors.panel}`}>
              <UsersList isDark={isDark} />
            </section>
          )}

          {activeView === 'config' && (
            <BotConfigPanel colors={colors} isDark={isDark} />
          )}
        </main>
      </div>
    </div>
  );
};

function KpiCard({ title, value, subtitle, colors }: { title: string; value: React.ReactNode; subtitle?: string; colors: any }) {
  return (
    <div className={`rounded-2xl border p-6 ${colors.panel}`}>
      <p className={`text-[12px] font-bold uppercase tracking-wider ${colors.muted}`}>{title}</p>
      <div className={`mt-4 text-4xl font-black ${colors.text}`}>{value}</div>
      {subtitle && <p className={`mt-2 text-[14px] font-medium ${colors.muted}`}>{subtitle}</p>}
    </div>
  );
}

function LegendRow({ label, value, color, colors }: { label: string; value: React.ReactNode; color: string; colors: any }) {
  return (
    <div className={`flex items-center justify-between gap-4 p-3 rounded-xl transition-colors ${colors.rowHover}`}>
      <div className="flex items-center gap-3">
        <span className={`w-3 h-3 rounded-full ${color}`} />
        <span className={`font-semibold text-[14px] ${colors.text}`}>{label}</span>
      </div>
      <span className={`font-bold ${colors.text} ${colors.badgeBg} px-3 py-1 rounded-md text-[14px]`}>{value}</span>
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
