// 📁 src/config/api.ts
// Point unique de configuration de l'API backend.
// Toute URL d'appel réseau du front DOIT passer par ce module :
// on évite ainsi les fallbacks divergents ('http://localhost' sans port,
// 'http://localhost:8000', '' …) qui ont déjà cassé l'inscription.
//
// - VITE_API_URL définie et non vide → utilisée telle quelle
//   (ex: http://localhost:8000 en dev, https://api.wagan.com en prod)
// - sinon → fallback dev : http://localhost:8000

const raw = (import.meta.env.VITE_API_URL ?? '').trim();

export const API_BASE: string = (raw !== '' ? raw : 'http://localhost:8000').replace(/\/+$/, '');

/** Construit une URL d'API absolue à partir d'un chemin. Ex: apiUrl('/api/auth/users/') */
export const apiUrl = (path: string): string => `${API_BASE}${path}`;

/**
 * Header d'authentification commun à toutes les requêtes protégées.
 * Le backend (simplejwt) accepte 'Bearer' — annoncé par son header
 * WWW-Authenticate — on le standardise donc partout.
 */
export const authHeader = (token: string | null | undefined): Record<string, string> =>
  token ? { Authorization: `Bearer ${token}` } : {};

/** Message affiché quand fetch échoue au niveau réseau (backend éteint, mauvaise URL, CORS). */
export const NETWORK_ERROR_MESSAGE =
  "Impossible de contacter le serveur. Vérifiez que le backend est démarré et que l'URL de l'API (VITE_API_URL) est correcte.";

/**
 * Convertit une erreur levée autour d'un fetch en message lisible.
 * Un échec réseau/CORS lève un TypeError ('Failed to fetch') : sans cette
 * traduction, l'utilisateur voit un message anglais cryptique.
 */
export const toUserMessage = (err: unknown, fallback: string): string => {
  if (err instanceof TypeError) return NETWORK_ERROR_MESSAGE;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
};
