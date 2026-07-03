// 📁 src/page/auth/googleAuth.ts
// Démarrage du flux OAuth Google — partagé entre Login et Register
// (le code était dupliqué à l'identique dans les deux pages).
//
// Flux :
// 1. GET /api/auth/o/google-oauth2/?redirect_uri=<backend>/api/auth/google/callback/
// 2. L'utilisateur s'authentifie sur Google
// 3. Google → callback Django, qui génère les JWT et redirige vers
//    <front>/auth/google?access=...&refresh=... (voir GoogleCallback.tsx)

import { API_BASE, toUserMessage } from '../../config/api';

export async function startGoogleLogin(): Promise<void> {
  try {
    // redirect_uri pointe vers Django (pas le frontend).
    // On force 'localhost' plutôt que 127.0.0.1 car c'est l'origine
    // enregistrée dans la Google Console.
    const backendDomain = API_BASE.replace('127.0.0.1', 'localhost');
    const redirectUri = `${backendDomain}/api/auth/google/callback/`;

    const res = await fetch(
      `${API_BASE}/api/auth/o/google-oauth2/?redirect_uri=${encodeURIComponent(redirectUri)}`
    );
    if (!res.ok) {
      throw new Error("Impossible de récupérer l'URL d'authentification Google");
    }
    const data = await res.json();
    if (!data.authorization_url) {
      throw new Error("Réponse invalide du serveur : URL d'autorisation Google absente.");
    }
    window.location.href = data.authorization_url;
  } catch (err) {
    throw new Error(toUserMessage(err, "Erreur d'initialisation de la connexion Google"));
  }
}
