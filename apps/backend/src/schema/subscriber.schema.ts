import { z } from 'zod';

export const CreateSubscriberDto = z.object({
    email: z.string().email('Invalid email address').meta({ example: 'john.doe@example.com' }),
    name: z.string().min(1, 'Name is required').meta({ example: 'John Doe' }),
});

export const UnsubscribeDto = z.object({
    email: z.string().email('Invalid email address').meta({ example: 'john.doe@example.com' }),
});

export const SendSingleEmailDto = z.object({
    email: z.string().email('Invalid email address').meta({ example: 'john.doe@example.com' }),
    subject: z.string().min(1, 'Subject is required').meta({ example: 'Hello Subscriber' }),
    content: z.string().min(1, 'Content is required').meta({ example: 'Thank you for following our blog. Here is a direct message.' }),
});

export const SendNewsletterDto = z.object({
    subject: z.string().min(1, 'Subject is required').meta({ example: 'Weekly Newsletter: Tech Updates' }),
    recentPostIds: z.array(z.number()).optional().meta({ example: [1, 2, 3] }),
});

export const GetAllSubscribersQuery = z.object({
    limit: z.coerce.number().default(10).optional(),
    offset: z.coerce.number().default(0).optional(),
});

export type CreateSubscriberDtoType = z.infer<typeof CreateSubscriberDto>;
export type UnsubscribeDtoType = z.infer<typeof UnsubscribeDto>;
export type SendSingleEmailDtoType = z.infer<typeof SendSingleEmailDto>;
export type SendNewsletterDtoType = z.infer<typeof SendNewsletterDto>;
export type GetAllSubscribersQueryType = z.infer<typeof GetAllSubscribersQuery>;
