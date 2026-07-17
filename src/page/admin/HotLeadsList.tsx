import React, { useEffect, useState } from 'react';
import { apiUrl, authHeader, toUserMessage } from '../../config/api';
import type { PanelColors } from './AdminDashboard';

interface HotLead {
  phone_number: string;
  last_message: string;
  sentiment_score: number;
  timestamp: string;
}

interface HotLeadsListProps {
  isDark: boolean;
  colors: PanelColors;
  onViewConversation: (phone: string) => void;
  onContactRequest: (phone: string) => void;
}

const HotLeadsList: React.FC<HotLeadsListProps> = ({ isDark, colors, onViewConversation, onContactRequest }) => {
  const [leads, setLeads] = useState<HotLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotLeads = async () => {
      try {
        const token = localStorage.getItem('access');
        const response = await fetch(apiUrl('/whatsapp/hot-leads/'), {
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(token),
          },
        });
        if (!response.ok) throw new Error("Erreur lors de la récupération des Hot Leads");
        const data = await response.json();
        setLeads(data.hot_leads || []);
      } catch (err: unknown) {
        setError(toUserMessage(err, 'Erreur lors de la récupération des Hot Leads'));
      } finally {
        setLoading(false);
      }
    };
    fetchHotLeads();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) return <div className={`p-8 text-center ${colors.muted}`}>Chargement des prospects chauds...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Erreur : {error}</div>;

  return (
    <div className={`p-6 ${colors.panel}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-bold ${colors.text} flex items-center gap-2`}>
          <span className="text-orange-500">🔥</span> Prospects Chauds
        </h2>
        <span className={`text-[13px] font-medium ${colors.muted}`}>
          {leads.length} prospect{leads.length !== 1 ? 's' : ''} chaud{leads.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leads.length === 0 ? (
          <div className={`col-span-full py-12 text-center ${colors.muted}`}>
            <p className="text-4xl mb-3">🎉</p>
            <p className="font-medium">Aucun prospect chaud en attente de suivi.</p>
          </div>
        ) : (
          leads.map((lead, index) => (
            <div
              key={`${lead.phone_number}-${index}`}
              className={`border rounded-2xl p-6 flex flex-col gap-4 ${colors.border} ${
                isDark ? 'bg-slate-800/30' : 'bg-slate-50'
              } shadow-sm transition-all hover:shadow-md hover:border-orange-500/50`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`text-lg font-bold tracking-tight ${colors.text}`}>{lead.phone_number}</h3>
                  <p className={`text-xs mt-1 font-medium ${colors.muted}`}>{formatDate(lead.timestamp)}</p>
                </div>
                <span className="bg-orange-500/10 text-orange-500 text-[11px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider">
                  Hot
                </span>
              </div>

              <div className="mt-auto flex flex-col gap-2">
                {/* Bouton 1 : Voir la conversation (ouvre la modale sans conséquence) */}
                <button
                  onClick={() => onViewConversation(lead.phone_number)}
                  className={`w-full font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  💬 Voir la conversation
                </button>
                {/* Bouton 2 : Contacter — déclenche une modale de confirmation dans le parent */}
                <button
                  onClick={() => onContactRequest(lead.phone_number)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  Contacter via WhatsApp
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HotLeadsList;
