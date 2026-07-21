import { z } from 'zod';

export const CreateTagDto = z.object({
    name: z.string().min(1, 'Name is required').meta({ example: 'React' }),
    slug: z.string().min(1, 'Slug is required').meta({ example: 'react' }),
});

export const TagIdParam = z.object({
    id: z.coerce.number().meta({ example: '1' }),
});

export type CreateTagDtoType = z.infer<typeof CreateTagDto>;
