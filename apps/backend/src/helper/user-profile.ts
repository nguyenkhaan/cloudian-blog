import { Role } from '@/model';

export interface UserProfileRecord {
    id: number;
    email: string;
    name: string;
    nickName?: string | null;
    active?: number | null;
    approve?: number | null;
    roles?: Array<{ role: Role }>;
}

export interface UserProfileResponse {
    id: number;
    email: string;
    name: string;
    nickName: string | null;
    active: number;
    approve: number;
    roles: string[];
}

export const mapUserProfileRecord = (
    user: UserProfileRecord
): UserProfileResponse => {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        nickName: user.nickName ?? null,
        active: user.active ?? 0,
        approve: user.approve ?? 0,
        roles: user.roles?.map((item) => item.role) ?? [],
    };
};

export const normalizeNickName = (value?: string | null) => {
    const nickname = value?.trim();
    return nickname ? nickname : null;
};
