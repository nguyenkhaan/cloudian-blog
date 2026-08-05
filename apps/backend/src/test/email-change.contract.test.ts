import { describe, expect, it } from 'bun:test';
import {
  RequestEmailChangeDto,
  VerifyChangeEmailDto,
} from '../schema/auth.schema';
import {
  buildEmailChangeRequestPayload,
  buildEmailChangeVerificationUrl,
  resolveEmailChangeRecipient,
} from '../helper/email-change';

describe('email change contract', () => {
  it('defaults self-service email change requests to the current-email verification path', () => {
    const parsed = RequestEmailChangeDto.parse({
      email: 'new@example.com',
    });

    expect(parsed.email).toBe('new@example.com');
    expect(parsed.verificationTarget).toBe('old');
  });

  it('allows verification links to use the shared code query parameter', () => {
    const parsed = VerifyChangeEmailDto.parse({
      code: 'abc123',
    });

    expect(parsed.code).toBe('abc123');
  });

  it('builds a token payload that keeps the current email until verification succeeds', () => {
    const payload = buildEmailChangeRequestPayload({
      userId: 7,
      currentEmail: 'old@example.com',
      newEmail: 'new@example.com',
      verificationTarget: 'old',
      expiresInSeconds: 600,
    });

    expect(payload.sub).toBe('7');
    expect(payload.oldEmail).toBe('old@example.com');
    expect(payload.newEmail).toBe('new@example.com');
    expect(payload.verificationTarget).toBe('old');
    expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it('builds the verify URL with the code query parameter and the verification target', () => {
    const url = buildEmailChangeVerificationUrl(
      'https://app.example.com',
      'signed-token',
      'new'
    );

    expect(url).toBe(
      'https://app.example.com/verify-email-change?code=signed-token&verificationTarget=new'
    );
  });

  it('routes verification mail to the selected recipient', () => {
    expect(
      resolveEmailChangeRecipient({
        currentEmail: 'old@example.com',
        newEmail: 'new@example.com',
        verificationTarget: 'old',
      })
    ).toBe('old@example.com');

    expect(
      resolveEmailChangeRecipient({
        currentEmail: 'old@example.com',
        newEmail: 'new@example.com',
        verificationTarget: 'new',
      })
    ).toBe('new@example.com');
  });
});
