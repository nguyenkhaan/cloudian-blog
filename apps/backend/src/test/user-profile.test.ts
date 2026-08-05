import { describe, expect, it } from 'bun:test';
import { mapUserProfileRecord, normalizeNickName } from '../helper/user-profile';

describe('user profile helper', () => {
    it('maps the editable profile payload into the response shape', () => {
        const result = mapUserProfileRecord({
            id: 1,
            email: 'user@gmail.com',
            name: 'Regular User',
            nickName: 'user',
            active: 1,
            approve: 1,
            roles: [{ role: 'user' }],
        } as any);

        expect(result).toEqual({
            id: 1,
            email: 'user@gmail.com',
            name: 'Regular User',
            nickName: 'user',
            active: 1,
            approve: 1,
            roles: ['user'],
        });
    });

    it('normalizes blank nicknames to null', () => {
        expect(normalizeNickName('   ')).toBeNull();
        expect(normalizeNickName('  cloudian  ')).toBe('cloudian');
    });
});
