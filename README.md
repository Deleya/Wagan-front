# Wagan - Frontend Dashboard (React / Vite / TypeScript)

Ce depot contient l'interface graphique (Dashboard) de la plateforme **Wagan**. Il permet aux administrateurs et conseillers de suivre en temps reel les performances du bot WhatsApp, d'analyser le pipeline de conversion des prospects et d'intervenir en cas de besoin.

## Fonctionnalites Principales

- **Tableau de Bord Analytique** : Suivi visuel des metriques cles (Prospects Chauds, En exploration, Alertes Humaines) via des graphiques Chart.js.
- **Modales de Conversation Temps Reel** : Cliquez sur un prospect pour visualiser l'integralite de son historique WhatsApp sous forme de bulles de chat natives (Prospect a gauche, Bot a droite).
- **Gestion des Hot Leads** : Disparition dynamique des cartes de leads chauds apres qu'un conseiller a clique sur le bouton de contact WhatsApp (avec validation anti-missclick).
- **Design Moderne** : Interface propre, composants reutilisables, typographie premium (TailwindCSS).

## Stack Technique

- **Framework** : React 18
- **Build Tool** : Vite
- **Langage** : TypeScript (Typage strict active)
- **Styling** : TailwindCSS
- **Requetes HTTP** : Axios (relie a l'API Django)
- **Graphiques** : react-chartjs-2 (Chart.js)

## Installation et Lancement en local

1. Clonez ce depot.
2. Assurez-vous d'avoir Node.js (v18+) installe.
3. Installez les dependances :
   npm install
4. Creez un fichier .env a la racine pour pointer vers l'API backend :
   VITE_API_URL=http://127.0.0.1:8000/api
5. Lancez le serveur de developpement :
   npm run dev

## Deploiement en Production

L'application est compilee pour des performances optimales avec :
   npm run build

Le dossier dist genere peut ensuite etre deploye sur Nginx, Vercel, Netlify ou Cloudflare Pages.

---
*Ce projet a ete developpe de maniere rigoureuse, en respectant les standards d'architecture logicielle Senior.*
