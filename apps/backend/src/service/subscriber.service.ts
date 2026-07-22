import { createDb } from '@/db';
import { PostModel, PostStatus, SubscriberModel } from '@/model';
import {
    CreateSubscriberDtoType,
    GetAllSubscribersQueryType,
    SendNewsletterDtoType,
    SendSingleEmailDtoType,
} from '@/schema/subscriber.schema';
import { MailService } from './mail.service';
import { TemplateService } from './template.service';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';

export async function subscribe(
    db: ReturnType<typeof createDb>,
    data: CreateSubscriberDtoType,
    mailService: MailService,
    feUrl: string
) {
    try {
        let subscriberId: number;
        const existing = await db.query.SubscriberModel.findFirst({
            where: eq(SubscriberModel.email, data.email),
        });

        if (existing) {
            if (existing.delete_at === null) {
                throw new HTTPException(400, {
                    message: 'Email is already subscribed',
                });
            } else {

                await db
                    .update(SubscriberModel)
                    .set({
                        name: data.name,
                        delete_at: null,
                    })
                    .where(eq(SubscriberModel.id, existing.id));
                subscriberId = existing.id;
            }
        } else {
            // Create new subscriber
            const result = await db
                .insert(SubscriberModel)
                .values({
                    email: data.email,
                    name: data.name,
                })
                .returning({ id: SubscriberModel.id });

            const created = result[0];
            if (!created) {
                throw new HTTPException(500, {
                    message: 'Failed to create subscriber',
                });
            }
            subscriberId = created.id;
        }


        const unsubscribeUrl = `${feUrl}/unsubscribe?email=${encodeURIComponent(data.email)}`;
        const html = TemplateService.subscriber({
            name: data.name,
            unsubscribeUrl,
            recentPosts: [],
        });

        try {
            await mailService.sendMail(data.email, 'Welcome to Cloudian Blog!', html);
        } catch (mailError) {
            console.error('Welcome email sending failed but subscription succeeded:', mailError);
        }

        return {
            success: true,
            subscriberId,
        };
    } catch (err) {
        console.error('Subscribe error: ', err);
        throw err;
    }
}

export async function unsubscribe(db: ReturnType<typeof createDb>, email: string) {
    try {
        const subscriber = await db.query.SubscriberModel.findFirst({
            where: and(
                eq(SubscriberModel.email, email),
                isNull(SubscriberModel.delete_at)
            ),
        });

        if (!subscriber) {
            throw new HTTPException(404, {
                message: 'Active subscriber not found',
            });
        }

        await db
            .update(SubscriberModel)
            .set({
                delete_at: new Date(),
            })
            .where(eq(SubscriberModel.id, subscriber.id));

        return {
            success: true,
        };
    } catch (err) {
        console.error('Unsubscribe error: ', err);
        throw err;
    }
}

export async function getAllSubscribers(
    db: ReturnType<typeof createDb>,
    query: GetAllSubscribersQueryType
) {
    try {
        const results = await db
            .select({
                id: SubscriberModel.id,
                email: SubscriberModel.email,
                name: SubscriberModel.name,
                note: SubscriberModel.note,
            })
            .from(SubscriberModel)
            .where(isNull(SubscriberModel.delete_at))
            .limit(query.limit || 10)
            .offset(query.offset || 0);

        return results;
    } catch (err) {
        console.error('Get all subscribers error: ', err);
        throw err;
    }
}

export async function sendSingleEmail(
    mailService: MailService,
    data: SendSingleEmailDtoType
) {
    try {
        await mailService.sendMail(data.email, data.subject, data.content);
        return {
            success: true,
        };
    } catch (err) {
        console.error('Send single email error: ', err);
        throw err;
    }
}

export async function sendNewsletter(
    db: ReturnType<typeof createDb>,
    mailService: MailService,
    data: SendNewsletterDtoType,
    feUrl: string
) {
    try {
        const subscribers = await db
            .select({
                name: SubscriberModel.name,
                email: SubscriberModel.email,
            })
            .from(SubscriberModel)
            .where(isNull(SubscriberModel.delete_at));

        if (subscribers.length === 0) {
            return {
                success: true,
                sentCount: 0,
                message: 'No active subscribers found',
            };
        }

        const recentPosts: { title: string; url: string }[] = [];
        if (data.recentPostIds && data.recentPostIds.length > 0) {
            const posts = await db
                .select({
                    title: PostModel.title,
                    slug: PostModel.slug,
                    id: PostModel.id,
                })
                .from(PostModel)
                .where(
                    and(
                        inArray(PostModel.id, data.recentPostIds),
                        eq(PostModel.status, PostStatus.PUBLISHED)
                    )
                );

            for (const post of posts) {
                recentPosts.push({
                    title: post.title,
                    url: `${feUrl}/posts/${post.slug || post.id}`,
                });
            }
        }


        const sendPromises = subscribers.map(async (sub) => {
            const unsubscribeUrl = `${feUrl}/unsubscribe?email=${encodeURIComponent(sub.email)}`;
            const html = TemplateService.subscriber({
                name: sub.name,
                unsubscribeUrl,
                recentPosts,
            });
            try {
                await mailService.sendMail(sub.email, data.subject, html);
            } catch (err) {
                console.error(`Newsletter send error to ${sub.email}:`, err);
            }
        });




        await Promise.all(sendPromises);

        return {
            success: true,
            sentCount: subscribers.length,
        };
    } catch (err) {
        console.error('Send newsletter broadcast error: ', err);
        throw err;
    }
}
