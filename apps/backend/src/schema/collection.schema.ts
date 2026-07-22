import { z } from 'zod';

export const CreateCollectionDto = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .meta({ example: 'Programming' }),
    description: z
        .string()
        .min(1, 'Description is required')
        .meta({ example: 'Guides about code' }),
    thumbnail: z
        .string()
        .optional()
        .nullable()
        .meta({ example: 'https://example.com/thumb.png' }),
});

export const UpdateCollectionDto = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .optional()
        .meta({ example: 'Updated Name' }),
    description: z
        .string()
        .min(1, 'Description is required')
        .optional()
        .meta({ example: 'Updated description' }),
    thumbnail: z
        .string()
        .optional()
        .nullable()
        .meta({ example: 'https://example.com/new-thumb.png' }),
});

export const CollectionIdParam = z.object({
    id: z.coerce.number().meta({ example: '1' }),
});

export type CreateCollectionDtoType = z.infer<typeof CreateCollectionDto>;
export type UpdateCollectionDtoType = z.infer<typeof UpdateCollectionDto>;
