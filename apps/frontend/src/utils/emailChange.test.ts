import { describe, expect, it } from 'bun:test';
import {
  getEmailChangeSuccessMessage,
  getEmailChangeTargetDescription,
  getEmailChangeTargetLabel,
  normalizeEmailChangeTarget,
} from './emailChange';

describe('email change helpers', () => {
  it('defaults unknown targets to the current-email flow', () => {
    expect(normalizeEmailChangeTarget(null)).toBe('old');
    expect(normalizeEmailChangeTarget(undefined)).toBe('old');
    expect(normalizeEmailChangeTarget('anything-else')).toBe('old');
  });

  it('keeps the current-email path as the recommended option', () => {
    expect(getEmailChangeTargetLabel('old')).toBe('Verify via current email');
    expect(getEmailChangeTargetDescription('old')).toContain('Recommended');
  });

  it('describes the fallback path clearly', () => {
    expect(getEmailChangeTargetLabel('new')).toBe('Verify via new email');
    expect(getEmailChangeTargetDescription('new')).toContain('no longer access');
  });

  it('explains the success message for each path', () => {
    expect(getEmailChangeSuccessMessage('old', 'new@example.com')).toContain(
      'current email'
    );
    expect(getEmailChangeSuccessMessage('new', 'new@example.com')).toContain(
      'fallback verification link'
    );
  });
});
