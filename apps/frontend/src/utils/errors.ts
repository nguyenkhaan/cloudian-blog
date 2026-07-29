const MESSAGE_KEYS = ['error', 'message', 'details'] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const normalizeValue = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || null;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    const messages = value.map(normalizeValue).filter(Boolean);
    return messages.length > 0 ? messages.join(', ') : null;
  }

  if (!isRecord(value)) {
    return null;
  }

  for (const key of MESSAGE_KEYS) {
    const message = normalizeValue(value[key]);
    if (message) return message;
  }

  const issues = normalizeValue(value.issues);
  if (issues) return issues;

  return null;
};

export const getErrorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.'): string => {
  if (isRecord(error) && isRecord(error.response)) {
    const responseMessage = normalizeValue(error.response.data);
    if (responseMessage) return responseMessage;
  }

  const message = normalizeValue(error);
  return message || fallback;
};

