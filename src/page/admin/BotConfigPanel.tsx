// 📁 src/page/admin/BotConfigPanel.tsx
// Onglet "Configuration du Chatbot" — Permet à l'admin de modifier
// dynamiquement la base de connaissances du bot WhatsApp depuis le Dashboard.

import React, { useEffect, useState } from 'react';
import { Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { apiUrl, authHeader, toUserMessage } from '../../config/api';

interface BotConfig {
  etablissement_nom: string;
  etablissement_description: string;
  etablissement_site: string;
  etablissement_inscription: string;
  catalogue_formations: string;
  horaires: string;
  updated_at?: string;
}

interface BotConfigPanelProps {
  colors: {
    page: string;
    panel: string;
    soft: string;
    text: string;
    muted: string;
    border: string;
    hover: string;
    rowHover: string;
    badgeBg: string;
  };
  isDark: boolean;
}

const BotConfigPanel: React.FC<BotConfigPanelProps> = ({ colors, isDark }) => {
  const [config, setConfig] = useState<BotConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // --- Chargement initial de la configuration depuis le backend ---
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const token = localStorage.getItem('access');
        const response = await fetch(apiUrl('/whatsapp/config/'), {
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(token),
          },
        });
        if (!response.ok) throw new Error('Impossible de charger la configuration.');
        const data = await response.json();
        setConfig(data);
      } catch (err: unknown) {
        setFeedback({ type: 'error', message: toUserMessage(err, 'Impossible de charger la configuration.') });
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // --- Sauvegarde de la configuration via PUT ---
  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setFeedback(null);
    try {
      const token = localStorage.getItem('access');
      const response = await fetch(apiUrl('/whatsapp/config/'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(token),
        },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error('Erreur lors de la sauvegarde.');
      const result = await response.json();
      setConfig(prev => prev ? { ...prev, updated_at: result.updated_at } : prev);
      setFeedback({ type: 'success', message: 'Configuration sauvegardée avec succès ! Le bot utilisera ces informations pour sa prochaine réponse.' });
    } catch (err: unknown) {
      setFeedback({ type: 'error', message: toUserMessage(err, 'Erreur lors de la sauvegarde.') });
    } finally {
      setSaving(false);
      // Effacer le feedback après 5 secondes
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleChange = (field: keyof BotConfig, value: string) => {
    setConfig(prev => prev ? { ...prev, [field]: value } : prev);
  };

  // --- Styles partagés ---
  const inputBase = `w-full rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
    isDark
      ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500'
      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
  }`;

  const labelBase = `block text-[12px] font-bold uppercase tracking-wider mb-2 ${colors.muted}`;

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-16 rounded-2xl border ${colors.panel}`}>
        <Loader2 className="animate-spin text-teal-500" size={32} />
        <span className={`ml-4 text-sm font-medium ${colors.muted}`}>Chargement de la configuration...</span>
      </div>
    );
  }

  if (!config) return null;

  return (
    <section className="space-y-8">

      {/* --- En-tête --- */}
      <div className={`rounded-2xl border p-6 ${colors.panel} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}>
        <div>
          <h2 className={`text-xl font-bold ${colors.text}`}>Base de Connaissances du Bot</h2>
          <p className={`text-sm mt-1 ${colors.muted}`}>
            Modifiez les informations ci-dessous. Le bot WhatsApp utilisera ces données pour ses prochaines réponses.
          </p>
          {config.updated_at && (
            <p className={`text-[11px] mt-2 ${colors.muted}`}>
              Dernière mise à jour : {new Date(config.updated_at).toLocaleString('fr-FR')}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-teal-500 hover:bg-teal-600 text-white shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>

      {/* --- Feedback visuel --- */}
      {feedback && (
        <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm font-medium ${
          feedback.type === 'success'
            ? (isDark ? 'bg-emerald-900/40 border-emerald-700 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700')
            : (isDark ? 'bg-rose-900/40 border-rose-700 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700')
        }`}>
          {feedback.type === 'success'
            ? <CheckCircle size={18} className="shrink-0 mt-0.5" />
            : <AlertCircle size={18} className="shrink-0 mt-0.5" />
          }
          {feedback.message}
        </div>
      )}

      {/* --- Informations de l'établissement --- */}
      <div className={`rounded-2xl border p-8 ${colors.panel} space-y-6`}>
        <h3 className={`text-base font-bold ${colors.text} border-b pb-4 ${colors.border}`}>
          🏫 Informations sur l'Établissement
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelBase}>Nom de l'établissement</label>
            <input
              type="text"
              className={inputBase}
              value={config.etablissement_nom}
              onChange={e => handleChange('etablissement_nom', e.target.value)}
              placeholder="Ex: Bakeli School of Technology"
            />
          </div>
          <div>
            <label className={labelBase}>Site web</label>
            <input
              type="url"
              className={inputBase}
              value={config.etablissement_site}
              onChange={e => handleChange('etablissement_site', e.target.value)}
              placeholder="https://bakeli.tech"
            />
          </div>
        </div>

        <div>
          <label className={labelBase}>Lien d'inscription</label>
          <input
            type="url"
            className={inputBase}
            value={config.etablissement_inscription}
            onChange={e => handleChange('etablissement_inscription', e.target.value)}
            placeholder="https://bakeli.tech/inscription"
          />
        </div>

        <div>
          <label className={labelBase}>Description générale</label>
          <textarea
            className={`${inputBase} resize-y min-h-[80px]`}
            value={config.etablissement_description}
            onChange={e => handleChange('etablissement_description', e.target.value)}
            placeholder="Décrivez brièvement l'école..."
          />
        </div>
      </div>

      {/* --- Catalogue des formations --- */}
      <div className={`rounded-2xl border p-8 ${colors.panel} space-y-4`}>
        <div>
          <h3 className={`text-base font-bold ${colors.text} border-b pb-4 ${colors.border}`}>
            📚 Catalogue des Formations
          </h3>
          <p className={`text-xs mt-3 mb-4 ${colors.muted}`}>
            Ce texte est injecté directement dans le cerveau du bot. Soyez précis : incluez le nom, le rôle visé, la durée et le lien pour chaque formation.
          </p>
        </div>
        <textarea
          className={`${inputBase} resize-y min-h-[320px] font-mono text-[13px] leading-relaxed`}
          value={config.catalogue_formations}
          onChange={e => handleChange('catalogue_formations', e.target.value)}
          placeholder="=== CATALOGUE ===&#10;1. Développement Web — 6 mois — lien..."
        />
      </div>

      {/* --- Horaires --- */}
      <div className={`rounded-2xl border p-8 ${colors.panel} space-y-4`}>
        <h3 className={`text-base font-bold ${colors.text} border-b pb-4 ${colors.border}`}>
          📅 Horaires & Disponibilités
        </h3>
        <p className={`text-xs ${colors.muted}`}>
          Le bot utilisera ces informations pour répondre aux questions sur les horaires. Indiquez clairement les jours et modalités.
        </p>
        <textarea
          className={`${inputBase} resize-y min-h-[100px]`}
          value={config.horaires}
          onChange={e => handleChange('horaires', e.target.value)}
          placeholder="Ex: Cours en présentiel du lundi au vendredi, de 8h à 18h. Pas de cours le week-end."
        />
      </div>

      {/* --- Bouton save bas de page --- */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold bg-teal-500 hover:bg-teal-600 text-white shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Sauvegarde en cours...' : 'Sauvegarder la configuration'}
        </button>
      </div>

    </section>
  );
};

export default BotConfigPanel;
