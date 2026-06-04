// 📁 src/page/admin/AdminDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Enregistrer les composants ChartJS (Étape obligatoire en React)
ChartJS.register(ArcElement, Tooltip, Legend);

// 1. On définit la "forme" (interface) des données que Django va nous renvoyer
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
}

const AdminDashboard: React.FC = () => {
  // 2. Création du State : null au départ, sera rempli avec les données Django
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 3. useEffect : S'exécute automatiquement quand on arrive sur la page
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('access'); // On récupère le token JWT
        
        // On interroge notre endpoint Django
        const response = await fetch('http://127.0.0.1:8000/whatsapp/dashboard/api/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });

        if (!response.ok) throw new Error("Erreur lors de la récupération des données");
        
        const jsonData = await response.json();
        setData(jsonData); // On stocke les données dans le State React
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false); // On arrête l'état de chargement
      }
    };

    fetchDashboardData();
  }, []); // Le tableau vide [] signifie "Ne le faire qu'une seule fois au démarrage"

  // 4. États de chargement et d'erreur
  if (loading) return <div className="p-8 text-center text-slate-500">Chargement des données CRM...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Erreur: {error}</div>;
  if (!data) return null;

  // 5. Configuration du graphique Doughnut
  const hasData = data.utilisateurs > 0;

  const chartData = {
    labels: hasData 
      ? ['Prospects Chauds', 'Prospects Froids', 'Alertes Humaines', ...(data.pending > 0 ? ['En attente'] : [])]
      : ['Aucune donnée'],
    datasets: [
      {
        data: hasData 
          ? [data.positifs, data.neutres, data.negatifs, ...(data.pending > 0 ? [data.pending] : [])]
          : [1],
        backgroundColor: hasData 
          ? ['#10b981', '#94a3b8', '#f43f5e', ...(data.pending > 0 ? ['#fbbf24'] : [])]
          : ['#f1f5f9'],
        hoverBackgroundColor: hasData 
          ? ['#059669', '#64748b', '#e11d48', ...(data.pending > 0 ? ['#d97706'] : [])]
          : ['#e2e8f0'],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '78%',
    plugins: {
      legend: { display: false }
    }
  };

  // 6. L'interface (Rendu JSX avec Tailwind, identique à votre HTML d'origine)
  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 antialiased p-8">

      {/* HEADER: CRM Overview & WORK.BAKETLI.TECH */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8">
        <div className="flex items-center gap-3">
          {/* Icône de type "Chart" similaire à l'image */}
          <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          <span className="text-xl font-bold text-slate-900">CRM Overview</span>
        </div>
        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          WORK.BAKETLI.TECH
        </div>
      </div>
      
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Satisfaction Client (WhatsApp)</h1>
        <p className="text-sm text-slate-500 mt-1">Analyse globale de la qualité du support CRM.</p>
      </div>

      {/* Cartes (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Total Messages */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Volume de Messages</p>
          <div className="mt-4 text-3xl font-semibold text-slate-900">{data.total}</div>
        </div>

        {/* Total Clients */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Clients Uniques</p>
          <div className="mt-4 text-3xl font-semibold text-slate-900">{data.utilisateurs}</div>
        </div>

        {/* Satisfaits -> Prospects Chauds */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Prospects Chauds</p>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">{data.p_positif}%</span>
          </div>
          <div className="mt-4 text-3xl font-semibold text-slate-900">{data.positifs}</div>
        </div>

        {/* Mécontents -> Alertes Humaines */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alertes Humaines</p>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">{data.p_negatif}%</span>
          </div>
          <div className="mt-4 text-3xl font-semibold text-slate-900">{data.negatifs}</div>
        </div>
      </div>

      {/* Section Graphique Doughnut */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 mb-8 flex flex-col lg:flex-row gap-12 items-center justify-around">
        
        {/* Légende du graphique */}
        <div className="w-full lg:w-1/3">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Qualification des Prospects</h3>
          <p className="text-sm text-slate-500 mb-8">Répartition des niveaux d'intérêt des clients WhatsApp.</p>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-emerald-500"></span><span className="text-sm font-medium text-slate-700">Prospects Chauds</span></div>
              <span className="text-sm font-semibold text-slate-900">{data.positifs} ({data.p_positif}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-slate-400"></span><span className="text-sm font-medium text-slate-700">Prospects Froids</span></div>
              <span className="text-sm font-semibold text-slate-900">{data.neutres} ({data.p_neutre}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-rose-500"></span><span className="text-sm font-medium text-slate-700">Alertes Humaines</span></div>
              <span className="text-sm font-semibold text-slate-900">{data.negatifs} ({data.p_negatif}%)</span>
            </div>
          </div>
        </div>

        {/* Le Graphique React-ChartJS-2 */}
        <div className="w-full lg:w-1/2 flex justify-center relative">
          <div className="w-72 h-72 relative">
            <Doughnut data={chartData} options={chartOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
              <span className="text-4xl font-bold text-slate-900">{data.utilisateurs}</span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Clients</span>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div className="mt-8 text-center border-t border-slate-200 pt-6">
        <p className="text-sm font-medium text-slate-400">
          Dernière synchronisation : {new Date(data.now).toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          }).replace(',', '')} • WORK.BAKETLI.TECH CRM
        </p>
      </div>

    </div>
  );
};

export default AdminDashboard;