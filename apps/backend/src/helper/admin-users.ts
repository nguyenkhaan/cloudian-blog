import { AuthProvider, Role } from '@/model';

export type AdminUserStatus = 'active' | 'suspended';

type AdminUserRelation = {
    role: Role;
};

type AdminOAuthRelation = {
    provider: AuthProvider | string | null;
};

export interface AdminUserRecord {
    id: number;
    email: string;
    name: string;
    nickName?: string | null;
    active?: number | null;
    approve?: number | null;
    roles?: AdminUserRelation[];
    oauths?: AdminOAuthRelation[];
}

export interface AdminUserListItem {
    id: number;
    name: string;
    email: string;
    nickName: string | null;
    roles: string[];
    providers: string[];
    joinedAt: string | null;
    status: AdminUserStatus;
}

export const mapAdminUserRecord = (
    user: AdminUserRecord
): AdminUserListItem => {
    const roles = user.roles?.map((item) => item.role) ?? [];
    const providers =
        user.oauths
            ?.map((item) => item.provider)
            .filter((provider): provider is string => Boolean(provider)) ?? [];

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        nickName: user.nickName ?? null,
        roles,
        providers: providers.length > 0 ? providers : [AuthProvider.LOCAL],
        joinedAt: null,
        status: user.active && user.approve ? 'active' : 'suspended',
    };
};

export const toggleAdminUserStatusValue = (
    currentStatus: AdminUserStatus
) => {
    const nextFlag = currentStatus === 'active' ? 0 : 1;
    return {
        active: nextFlag,
        approve: nextFlag,
    };
};
