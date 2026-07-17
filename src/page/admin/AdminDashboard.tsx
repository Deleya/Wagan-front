import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { BarChart3, LogOut, MessageCircle, PanelLeftClose, PanelLeftOpen, Settings, Users, Flame, Eye } from 'lucide-react';
import UsersList from './UsersList';
import BotConfigPanel from './BotConfigPanel';
import HotLeadsList from './HotLeadsList';
import { logout } from '../auth/authSlice';
import { useAppDispatch } from '../hooks/hooks';
import { DatePicker, ConfigProvider, theme, Modal, Spin } from 'antd';
import { apiUrl, authHeader, toUserMessage } from '../../config/api';

const { RangePicker } = DatePicker;

ChartJS.register(ArcElement, Tooltip, Legend);

type ActiveView = 'analyse' | 'prospects' | 'users' | 'config' | 'hotleads';

// Palette partagée entre le dashboard et ses sous-panneaux
export interface PanelColors {
  page: string;
  panel: string;
  soft: string;
  text: string;
  muted: string;
  border: string;
  hover: string;
  rowHover: string;
  badgeBg: string;
}

interface Prospect {
  phone?: string;
  sentiment?: string;
  avg_score?: number;
  nb_messages?: number;
  last_contact?: string;
  first_contact?: string;
  statut?: string;
  color?: string;
}

interface DashboardData {
  total: number;
  utilisateurs: number;
  positifs: number;
  neutres: number;
  nb_lost_leads: number;
  nb_bot_stuck: number;
  nb_angry: number;
  pending: number;
  p_positif: number;
  p_neutre: number;
  nb_analyses: number;
  now: string;
  prospects_list?: Prospect[];
  taux_conversion?: number;
  nb_prospects_convertis?: number;
  avg_messages_to_convert?: number | null;
  taux_bot_stuck?: number;
  hot_leads_today?: number;
}

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('analyse');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [selectedProspectPhone, setSelectedProspectPhone] = useState<string | null>(null);
  const [prospectMessages, setProspectMessages] = useState<{role: string, content: string, timestamp?: string}[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [confirmContactPhone, setConfirmContactPhone] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [prospectMessages]);

  useEffect(() => {
    if (!selectedProspectPhone) return;
    const fetchMessages = async (isFirstLoad = false) => {
      if (isFirstLoad) setLoadingMessages(true);
      try {
        const token = localStorage.getItem('access');
        const response = await fetch(apiUrl(`/whatsapp/prospects/${selectedProspectPhone}/messages/`), {
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(token),
          },
        });
        if (response.ok) {
          const resData = await response.json();
          setProspectMessages(resData.messages || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isFirstLoad) setLoadingMessages(false);
      }
    };
    fetchMessages(true);
    const intervalId = setInterval(() => fetchMessages(false), 3000);
    return () => clearInterval(intervalId);
  }, [selectedProspectPhone]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('access');
        let url = apiUrl('/whatsapp/dashboard/api/');
        if (dateRange) {
          url += `?start_date=${dateRange[0]}&end_date=${dateRange[1]}`;
        }
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(token),
          },
        });

        if (!response.ok) throw new Error("Erreur lors de la recuperation des donnees");
        setData(await response.json());
      } catch (err: unknown) {
        setError(toUserMessage(err, 'Erreur lors de la recuperation des donnees'));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dateRange]);

  const colors: PanelColors = isDark ? {
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
    // On regroupe lost_lead + bot_stuck + angry en "Alertes" pour le graphe
    const nbAlertes = (data?.nb_lost_leads ?? 0) + (data?.nb_bot_stuck ?? 0) + (data?.nb_angry ?? 0);
    return {
      labels: hasData
        ? ['Prospects Chauds', 'En exploration 🔎', 'Alertes Humaines', ...(data.pending > 0 ? ['En attente'] : [])]
        : ['Aucune donnee'],
      datasets: [{
        data: hasData
          ? [data.positifs, data.neutres, nbAlertes, ...(data.pending > 0 ? [data.pending] : [])]
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
    { key: 'hotleads' as const, label: 'Hot Leads', icon: Flame },
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
                  : activeView === 'hotleads' ? '🔥 Prospects Chauds'
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
                <KpiCard title="Prospects" value={data.utilisateurs} colors={colors} />
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
                    <LegendRow
                      label="En exploration 🔎"
                      value={`${data.neutres} (${data.p_neutre}%)`}
                      color="bg-slate-500"
                      colors={colors}
                      tooltip="Prospects ayant interagi sans signal d'intention fort. Ils explorent et peuvent basculer vers 'Chaud' à tout moment."
                    />
                    <LegendRow
                      label="Alertes Humaines"
                      value={`${(data.nb_lost_leads ?? 0) + (data.nb_bot_stuck ?? 0) + (data.nb_angry ?? 0)} prospect(s)`}
                      color="bg-rose-500"
                      colors={colors}
                    />
                    {data.pending > 0 && <LegendRow label="En attente" value={data.pending} color="bg-amber-500" colors={colors} />}
                  </div>
                </div>

                <div className={`rounded-2xl border p-8 flex items-center justify-center ${colors.panel}`}>
                  <div className="relative w-full max-w-[280px] aspect-square">
                    <Doughnut data={chartData} options={chartOptions} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                      <span className={`text-5xl font-black ${colors.text}`}>{data.utilisateurs}</span>
                      <span className={`text-[12px] font-bold uppercase tracking-widest mt-1 ${colors.muted}`}>Prospects</span>
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
                      <th className={`px-6 py-4 text-left font-semibold uppercase tracking-wider text-[12px] ${colors.muted}`}>Dernier contact</th>
                      <th className={`px-6 py-4 text-left font-semibold uppercase tracking-wider text-[12px] ${colors.muted}`}>Premier contact</th>
                      <th className={`px-6 py-4 text-center font-semibold uppercase tracking-wider text-[12px] ${colors.muted}`}>Conversation</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                    {prospects.length === 0 ? (
                      <tr>
                        <td colSpan={6} className={`px-6 py-12 text-center text-sm ${colors.muted}`}>Aucun prospect dans cette période.</td>
                      </tr>
                    ) : prospects.map((prospect, index) => (
                      <tr 
                        key={`${prospect.phone ?? 'prospect'}-${index}`} 
                        className={`${colors.rowHover} group`}
                      >
                        <td className={`px-6 py-4 font-semibold text-[14px] ${colors.text}`}>{prospect.phone ?? '-'}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[12px] font-semibold inline-flex items-center gap-1.5`}
                            style={{
                              backgroundColor: prospect.color ? `${prospect.color}22` : undefined,
                              color: prospect.color ?? (isDark ? '#94a3b8' : '#64748b'),
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: prospect.color ?? '#94a3b8' }}
                            />
                            {prospect.statut ?? prospect.sentiment ?? '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-medium ${colors.text}`}>{prospect.nb_messages ?? '-'}</span>
                        </td>
                        <td className={`px-6 py-4 ${colors.muted} font-medium text-[14px]`}>{formatDate(prospect.last_contact)}</td>
                        <td className={`px-6 py-4 ${colors.muted} font-medium text-[14px]`}>{formatDate(prospect.first_contact)}</td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedProspectPhone(prospect.phone ?? null)}
                            title="Voir l'historique de conversation"
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                              isDark
                                ? 'bg-teal-500/10 text-teal-400 hover:bg-teal-500/20'
                                : 'bg-teal-50 text-teal-600 hover:bg-teal-100'
                            }`}
                          >
                            <Eye size={13} />
                            Voir conv.
                          </button>
                        </td>
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

          {activeView === 'hotleads' && (
            <section className={`rounded-2xl border overflow-hidden ${colors.panel}`}>
              <HotLeadsList
                colors={colors}
                isDark={isDark}
                onViewConversation={setSelectedProspectPhone}
                onContactRequest={(phone) => setConfirmContactPhone(phone)}
              />
            </section>
          )}

          {activeView === 'config' && (
            <BotConfigPanel colors={colors} isDark={isDark} />
          )}
        </main>
      </div>

      <ConfigProvider theme={{ algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
        {/* Modale historique de conversation */}
        <Modal
          title={
            <span className="flex items-center gap-2">
              <MessageCircle size={16} className="text-teal-500" />
              Conversation — {selectedProspectPhone}
            </span>
          }
          open={!!selectedProspectPhone}
          onCancel={() => {
            setSelectedProspectPhone(null);
            setProspectMessages([]);
          }}
          footer={null}
          width={620}
        >
          {loadingMessages ? (
            <div className="py-8 text-center"><Spin /></div>
          ) : prospectMessages.length === 0 ? (
            <div className="py-8 text-center text-slate-500">Aucun message trouvé pour ce prospect.</div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[62vh] overflow-y-auto pr-2 pb-2">
              {prospectMessages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                    {msg.role === 'user' ? '👤 Prospect' : '🤖 Bot Wagan'}
                  </span>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-teal-500 text-white rounded-tr-sm'
                      : isDark ? 'bg-slate-700 text-slate-100 rounded-tl-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                  }`}>
                    <p className="text-[13px] whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    {msg.timestamp && (
                      <p className={`text-[10px] mt-1 ${
                        msg.role === 'user' ? 'text-teal-100' : isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </Modal>

        {/* Modale de confirmation avant contact WhatsApp (anti-faux-clic) */}
        <Modal
          title={<span className="flex items-center gap-2 text-amber-500">⚠️ Confirmer le contact</span>}
          open={!!confirmContactPhone}
          onCancel={() => setConfirmContactPhone(null)}
          onOk={() => {
            if (confirmContactPhone) {
              const cleanPhone = confirmContactPhone.replace(/[^0-9]/g, '');
              window.open(`https://wa.me/${cleanPhone}`, '_blank');
            }
            setConfirmContactPhone(null);
          }}
          okText="Oui, contacter"
          cancelText="Annuler"
          okButtonProps={{ style: { backgroundColor: '#10b981', borderColor: '#10b981' } }}
          width={480}
        >
          <div className="py-3 space-y-3">
            <p className="text-[15px] font-medium text-slate-700 dark:text-slate-200">
              Vous êtes sur le point d'ouvrir WhatsApp pour contacter le prospect :
            </p>
            <p className="text-xl font-bold text-teal-600">{confirmContactPhone}</p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-[13px] text-amber-800">
              <strong>⚠️ Action irréversible :</strong> En confirmant, ce prospect sera retiré de votre liste de Hot Leads. Cette action signifie que vous prenez en charge le suivi de ce contact.
            </div>
          </div>
        </Modal>
      </ConfigProvider>
    </div>
  );
};

function KpiCard({ title, value, subtitle, colors }: { title: string; value: React.ReactNode; subtitle?: string; colors: PanelColors }) {
  return (
    <div className={`rounded-2xl border p-6 ${colors.panel}`}>
      <p className={`text-[12px] font-bold uppercase tracking-wider ${colors.muted}`}>{title}</p>
      <div className={`mt-4 text-4xl font-black ${colors.text}`}>{value}</div>
      {subtitle && <p className={`mt-2 text-[14px] font-medium ${colors.muted}`}>{subtitle}</p>}
    </div>
  );
}

function LegendRow({ label, value, color, colors, tooltip }: { label: string; value: React.ReactNode; color: string; colors: PanelColors; tooltip?: string }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 p-3 rounded-xl transition-colors ${colors.rowHover}`}
      title={tooltip}
    >
      <div className="flex items-center gap-3">
        <span className={`w-3 h-3 rounded-full ${color}`} />
        <span className={`font-semibold text-[14px] ${colors.text}`}>{label}</span>
        {tooltip && <span className="text-slate-400 text-[11px] cursor-help">ⓘ</span>}
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
