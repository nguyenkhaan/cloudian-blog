export type EmailChangeVerificationTarget = 'old' | 'new';

export const normalizeEmailChangeTarget = (
  value: string | null | undefined
): EmailChangeVerificationTarget => {
  return value === 'new' ? 'new' : 'old';
};

export const getEmailChangeTargetLabel = (
  target: EmailChangeVerificationTarget
) => {
  return target === 'new' ? 'Verify via new email' : 'Verify via current email';
};

export const getEmailChangeTargetDescription = (
  target: EmailChangeVerificationTarget
) => {
  if (target === 'new') {
    return 'Use this if you can no longer access your current inbox. We will send the confirmation link to the new one.';
  }

  return 'Recommended. We will keep your current email active and send the confirmation link in your inbox.';
};

export const getEmailChangeSuccessMessage = (
  target: EmailChangeVerificationTarget,
  email: string
) => {
  if (target === 'new') {
    return `We sent a fallback verification link to ${email}. Please confirm from the new inbox to complete the email change.`;
  }

  return `We sent a verification link to your current email. After you confirm, your account will start using ${email}.`;
};
