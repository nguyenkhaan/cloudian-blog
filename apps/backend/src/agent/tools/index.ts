import { createDb } from '@/db';
import {
    getDetailPostToolService,
    getListPostToolService,
    getPostMetadataToolService,
    searchPostToolService,
} from '@/service/agent.service';
import { AppEnv } from '@/types/env';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const agentTools = (db: ReturnType<typeof createDb>) => {
    // Search post tool
    const searchPost = tool(
        async ({ query, limit, offset }) => {
            const response = await searchPostToolService(
                db,
                query,
                limit,
                offset
            );
            return response;
        },
        {
            name: 'search_posts',
            description:
                'Search blog posts by title or content using a search query.',
            schema: z.object({
                query: z.string(),
                limit: z.number(),
                offset: z.number(),
            }),
        }
    );
    const listPosts = tool(
        async ({ limit, offset }) => {
            const response = await getListPostToolService(db, limit, offset);
            return response;
        },
        {
            name: 'list_published_post',
            description: '',
            schema: z.object({
                limit: z.number(),
                offset: z.number(),
            }),
        }
    );
    // Get post detail
    const getDetailPost = tool(
        async ({ slugOrId }: { slugOrId: string }) => {
            const response = await getDetailPostToolService(db, slugOrId);
            return response;
        },
        {
            name: 'get_detail_post',
            description: "Get a detail post by id (postId) or post's slug",
            schema: z.object({
                slugOrId: z.string(),
            }),
        }
    );

    const getPostMetadata = tool(
        async ({ postId }) => {
            const response = await getPostMetadataToolService(db, postId);
            return response;
        },
        {
            name: 'get_post_metadata',
            description:
                "Get a post metadata, include: post's tags, post's slug, post's collections name and a short first 2000 characters content",
            schema: z.object({
                postId: z.number(),
            }),
        }
    );
    return [searchPost, listPosts, getDetailPost, getPostMetadata];
};
