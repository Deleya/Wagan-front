import React, { useEffect, useState } from 'react';
import { apiUrl, authHeader, toUserMessage } from '../../config/api';
import type { PanelColors } from './AdminDashboard';

interface HotLead {
  phone_number: string;
  last_message: string;
  sentiment_score: number;
  timestamp: string;
}

const HotLeadsList: React.FC<{ isDark: boolean; colors: PanelColors }> = ({ isDark, colors }) => {
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

  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  if (loading) return <div className={`p-8 text-center ${colors.muted}`}>Chargement des prospects chauds...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Erreur : {error}</div>;

  return (
    <div className={`p-6 ${colors.panel}`}>
      <h2 className={`text-xl font-bold mb-6 ${colors.text} flex items-center gap-2`}>
        <span className="text-orange-500">🔥</span> Prospects Chauds
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leads.length === 0 ? (
          <p className={colors.muted}>Aucun prospect chaud pour le moment.</p>
        ) : (
          leads.map((lead, index) => (
            <div key={index} className={`border rounded-2xl p-6 flex flex-col gap-4 ${colors.border} ${isDark ? 'bg-slate-800/30' : 'bg-slate-50'} shadow-sm transition-all hover:shadow-md hover:border-orange-500/50`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`text-lg font-bold tracking-tight ${colors.text}`}>{lead.phone_number}</h3>
                  <p className={`text-xs mt-1 font-medium ${colors.muted}`}>{formatDate(lead.timestamp)}</p>
                </div>
                <span className="bg-orange-500/10 text-orange-500 text-[11px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider">Hot</span>
              </div>
              
              <div className={`p-4 rounded-xl text-sm font-medium italic ${isDark ? 'bg-slate-900/50' : 'bg-white'} ${colors.text}`}>
                "{lead.last_message}"
              </div>
              
              <button 
                onClick={() => openWhatsApp(lead.phone_number)}
                className="mt-auto w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Contacter via WhatsApp
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HotLeadsList;
