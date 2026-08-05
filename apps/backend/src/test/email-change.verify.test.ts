import { describe, expect, it } from 'bun:test';
import { verifyChangeEmail } from '../service/auth.service';
import { createToken } from '../service/jwt.service';
import { TokenType } from '../base/jwt.enum';

const SECRET = 'test-secret';

const buildToken = async (payload: Record<string, unknown>) => {
  return createToken(TokenType.VERIFY_RESET_EMAIL, payload, SECRET);
};

describe('verifyChangeEmail', () => {
  it('updates the user email when the current email still matches the old inbox', async () => {
    let currentEmail = 'old@example.com';
    let updateCalls = 0;

    const db = {
      query: {
        UserModel: {
          findFirst: async () => ({
            id: 7,
            email: currentEmail,
          }),
        },
      },
      update: () => ({
        set: () => ({
          where: async () => {
            updateCalls += 1;
            currentEmail = 'new@example.com';
          },
        }),
      }),
    } as any;

    const token = await buildToken({
      sub: '7',
      oldEmail: 'old@example.com',
      newEmail: 'new@example.com',
      verificationTarget: 'old',
      exp: Math.floor(Date.now() / 1000) + 600,
    });

    await expect(verifyChangeEmail(db, token, SECRET)).resolves.toBe(
      "Account's email has been reset successfully"
    );
    expect(updateCalls).toBe(1);
    expect(currentEmail).toBe('new@example.com');
  });

  it('returns success when the same verify link is opened again after the email was already updated', async () => {
    let currentEmail = 'new@example.com';
    let updateCalls = 0;

    const db = {
      query: {
        UserModel: {
          findFirst: async () => ({
            id: 7,
            email: currentEmail,
          }),
        },
      },
      update: () => ({
        set: () => ({
          where: async () => {
            updateCalls += 1;
            currentEmail = 'new@example.com';
          },
        }),
      }),
    } as any;

    const token = await buildToken({
      sub: '7',
      oldEmail: 'old@example.com',
      newEmail: 'new@example.com',
      verificationTarget: 'old',
      exp: Math.floor(Date.now() / 1000) + 600,
    });

    await expect(verifyChangeEmail(db, token, SECRET)).resolves.toBe(
      "Account's email has been reset successfully"
    );
    expect(updateCalls).toBe(0);
  });
});
