interface JwtPayload {
  exp?: number;
}

const AUTH_SESSION_EXPIRES_AT_KEY = 'authSessionExpiresAt';
export const AUTH_SESSION_LIFETIME_MS = 24 * 60 * 60 * 1000;

export const clearStoredAuth = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem(AUTH_SESSION_EXPIRES_AT_KEY);
};

export const setStoredSessionExpiresAt = (expiresAt: number) => {
  localStorage.setItem(AUTH_SESSION_EXPIRES_AT_KEY, String(expiresAt));
};

export const getStoredSessionExpiresAt = (): number | null => {
  const rawValue = localStorage.getItem(AUTH_SESSION_EXPIRES_AT_KEY);
  if (!rawValue) return null;

  const parsedValue = Number(rawValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

export const isStoredSessionExpired = () => {
  const expiresAt = getStoredSessionExpiresAt();
  return expiresAt !== null && expiresAt <= Date.now();
};

export const getJwtExpirationMs = (token: string | null): number | null => {
  if (!token) return null;

  const [, payloadPart] = token.split('.');
  if (!payloadPart) return null;

  try {
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const payload = JSON.parse(atob(padded)) as JwtPayload;

    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

export const getRefreshDelayMs = (
  token: string | null,
  sessionExpiresAt: number | null = null,
  bufferMs = 60_000
): number | null => {
  const expirationMs = getJwtExpirationMs(token);
  if (!expirationMs) return null;

  const effectiveExpirationMs =
    sessionExpiresAt !== null ? Math.min(expirationMs, sessionExpiresAt) : expirationMs;

  return Math.max(effectiveExpirationMs - Date.now() - bufferMs, 0);
};
