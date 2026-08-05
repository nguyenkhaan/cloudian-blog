import { describe, expect, it } from 'bun:test';
import {
  mapAdminUserRecord,
  toggleAdminUserStatusValue,
} from '../helper/admin-users';

describe('admin users helper', () => {
  it('maps a database user record into the admin dashboard shape', () => {
    const user = mapAdminUserRecord({
      id: 2,
      email: 'manager@gmail.com',
      name: 'Manager User',
      nickName: 'manager',
      active: 1,
      approve: 1,
      roles: [{ role: 'manager' }, { role: 'user' }],
      oauths: [{ provider: 'local' }],
    } as any);

    expect(user.id).toBe(2);
    expect(user.email).toBe('manager@gmail.com');
    expect(user.roles).toEqual(['manager', 'user']);
    expect(user.status).toBe('active');
    expect(user.providers).toEqual(['local']);
    expect(user.joinedAt).toBeNull();
  });

  it('maps inactive users as suspended in the admin dashboard', () => {
    const user = mapAdminUserRecord({
      id: 3,
      email: 'user@gmail.com',
      name: 'Regular User',
      active: 0,
      approve: 0,
      roles: [{ role: 'user' }],
      oauths: [{ provider: 'google' }],
    } as any);

    expect(user.status).toBe('suspended');
  });

  it('toggles the approval flags for admin status updates', () => {
    expect(toggleAdminUserStatusValue('active')).toEqual({ active: 0, approve: 0 });
    expect(toggleAdminUserStatusValue('suspended')).toEqual({ active: 1, approve: 1 });
  });
});
