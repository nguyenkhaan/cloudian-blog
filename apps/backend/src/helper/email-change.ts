export type EmailChangeVerificationTarget = 'old' | 'new';

export interface EmailChangeRequestPayloadInput {
  userId: number;
  currentEmail: string;
  newEmail: string;
  verificationTarget: EmailChangeVerificationTarget;
  expiresInSeconds: number;
}

export interface EmailChangeRecipientInput {
  currentEmail: string;
  newEmail: string;
  verificationTarget: EmailChangeVerificationTarget;
}

export const buildEmailChangeRequestPayload = (
  input: EmailChangeRequestPayloadInput
) => ({
  sub: input.userId.toString(),
  oldEmail: input.currentEmail,
  newEmail: input.newEmail,
  verificationTarget: input.verificationTarget,
  exp: Math.floor(Date.now() / 1000) + input.expiresInSeconds,
});

export const buildEmailChangeVerificationUrl = (
  feUrl: string,
  code: string,
  verificationTarget: EmailChangeVerificationTarget
) => {
  const url = new URL('/verify-email-change', feUrl);
  url.searchParams.set('code', code);
  url.searchParams.set('verificationTarget', verificationTarget);
  return url.toString();
};

export const resolveEmailChangeRecipient = (
  input: EmailChangeRecipientInput
) => {
  return input.verificationTarget === 'new'
    ? input.newEmail
    : input.currentEmail;
};
