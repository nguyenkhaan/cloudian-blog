interface JwtPayload {
  exp?: number;
}

export const clearStoredAuth = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
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

export const getRefreshDelayMs = (token: string | null, bufferMs = 60_000): number | null => {
  const expirationMs = getJwtExpirationMs(token);
  if (!expirationMs) return null;

  return Math.max(expirationMs - Date.now() - bufferMs, 0);
};

