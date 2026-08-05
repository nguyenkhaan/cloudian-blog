import { z } from 'zod';

export const UserIdParam = z.object({
    userId: z.coerce.number().meta({ example: '1' }),
});

export const UpdateUserEmailDto = z.object({
    email: z.email().meta({ example: 'new-admin-user@gmail.com' }),
});

export const UpdateProfileDto = z.object({
    name: z.string().min(1).meta({ example: 'Cloudian User' }),
    nickName: z.string().optional().nullable().meta({ example: 'cloudian' }),
});

export type UpdateUserEmailDtoType = z.infer<typeof UpdateUserEmailDto>;
export type UpdateProfileDtoType = z.infer<typeof UpdateProfileDto>;
