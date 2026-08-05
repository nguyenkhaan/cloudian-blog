import { z } from 'zod';

export const UserIdParam = z.object({
    userId: z.coerce.number().meta({ example: '1' }),
});

export const UpdateUserEmailDto = z.object({
    email: z.email().meta({ example: 'new-admin-user@gmail.com' }),
});

export type UpdateUserEmailDtoType = z.infer<typeof UpdateUserEmailDto>;
