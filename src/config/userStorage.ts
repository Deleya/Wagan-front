// 📁 src/config/userStorage.ts
// Cloisonne les données locales sensibles (historique de chat) PAR UTILISATEUR.
// Sans ce namespace, deux comptes qui se connectent sur le même navigateur
// partagent le même localStorage → fuite de conversations entre comptes.

/** Identifiant de l'utilisateur courant, extrait du JWT simplejwt (claim user_id). */
export const currentUserId = (): string => {
  const token = localStorage.getItem('access');
  if (!token || token === 'undefined' || token === 'null') return 'anonymous';
  try {
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
    return String(payload.user_id ?? 'anonymous');
  } catch {
    return 'anonymous';
  }
};

/** Clé localStorage namespacée par utilisateur. Ex: "wagan_history:42" */
export const userKey = (base: string): string => `${base}:${currentUserId()}`;

export const loadUserJSON = <T>(base: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(userKey(base));
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const saveUserJSON = (base: string, value: unknown): void => {
  localStorage.setItem(userKey(base), JSON.stringify(value));
};

export const removeUserKey = (base: string): void => {
  localStorage.removeItem(userKey(base));
};

// ---------------------------------------------------------------------------
// Migration : l'ancienne clé GLOBALE "wagan_history" (pré-cloisonnement) est
// transférée vers l'espace de l'utilisateur connecté, puis supprimée.
// Exécutée une seule fois au chargement de l'app (import side-effect).
// ---------------------------------------------------------------------------
const LEGACY_HISTORY_KEY = 'wagan_history';

(function migrateLegacyHistory() {
  const legacy = localStorage.getItem(LEGACY_HISTORY_KEY);
  if (legacy === null) return;
  const uid = currentUserId();
  const target = `${LEGACY_HISTORY_KEY}:${uid}`;
  if (uid !== 'anonymous' && localStorage.getItem(target) === null) {
    localStorage.setItem(target, legacy);
  }
  localStorage.removeItem(LEGACY_HISTORY_KEY);
})();
