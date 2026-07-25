import { createDb } from '@/db';
import {
    getDetailPostToolService,
    getListPostToolService,
    getPostMetadataToolService,
    searchPostToolService,
} from '@/service/agent.service';
import { getAllCollections, getCollectionDetails } from '@/service/collection.service';
import { getAllTags } from '@/service/tag.service';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import soulSkill from '../skills/soul/SKILL.md';
import searchSkill from '../skills/search/SKILL.md';
import researchSkill from '../skills/research/SKILL.md';
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
            description: 'Search published blog posts by title or content matching a query keyword.',
            schema: z.object({
                query: z.string().describe('The keyword query to search for in post titles or content.'),
                limit: z.number().optional().default(10).describe('Maximum number of posts to return (default 10).'),
                offset: z.number().optional().default(0).describe('Pagination offset to skip posts (default 0).'),
            }),
        }
    );

    // List published posts
    const listPosts = tool(
        async ({ limit, offset }) => {
            const response = await getListPostToolService(db, limit, offset);
            return response;
        },
        {
            name: 'list_published_post',
            description: 'Retrieve a list of all published blog posts, including author details, tags, and collections.',
            schema: z.object({
                limit: z.number().optional().default(10).describe('Maximum number of posts to return (default 10).'),
                offset: z.number().optional().default(0).describe('Pagination offset to skip posts (default 0).'),
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
            description: 'Retrieve the detailed content, title, and other details of a specific blog post using its ID or URL slug.',
            schema: z.object({
                slugOrId: z.string().describe('The ID (stringified number) or the URL slug of the post.'),
            }),
        }
    );

    // Get post metadata
    const getPostMetadata = tool(
        async ({ postId }) => {
            const response = await getPostMetadataToolService(db, postId);
            return response;
        },
        {
            name: 'get_post_metadata',
            description: 'Retrieve metadata for a post, including its tags, slug, collection names, and a preview of the first 2000 characters of its content.',
            schema: z.object({
                postId: z.number().describe('The numeric ID of the post.'),
            }),
        }
    );


    const listCollections = tool(
        async () => {
            const response = await getAllCollections(db);
            return response;
        },
        {
            name: 'list_collections',
            description: 'Get a list of all categories/collections available on the blog, including their names, descriptions, and post counts.',
            schema: z.object({}),
        }
    );

    // List tags
    const listTags = tool(
        async () => {
            const response = await getAllTags(db);
            return response;
        },
        {
            name: 'list_tags',
            description: 'Get a list of all tags (keywords/topics) currently assigned to blog posts.',
            schema: z.object({}),
        }
    );

    // Get posts by collection/category
    const getPostsByCollection = tool(
        async ({ collectionId }) => {
            const response = await getCollectionDetails(db, collectionId);
            return response;
        },
        {
            name: 'get_posts_by_collection',
            description: 'Retrieve a list of all posts belonging to a specific collection/category ID. Use list_collections to retrieve the ID first.',
            schema: z.object({
                collectionId: z.number().describe('The numeric ID of the collection.'),
            }),
        }
    );
    const fetchSkills = tool(
        async ({ skillName }) => {
            switch (skillName) {
                case 'soul':
                    return soulSkill
                case 'search':
                    return searchSkill
                case 'research':
                    return researchSkill
            }
        },
        {
            name: 'fetch_skill_guideline',
            description: 'Retrieve operational guidelines (instructions) for specialized tasks: research (synthesis/citations), search (query expansion/filters), or soul (adaptive style/learning from corrections). Call this tool before executing a complex task to ensure accuracy',
            schema: z.object({
                skillName: z.enum(['soul', 'search', 'research']).describe('The name of the skill to fetch guideline for agent')
            })
        }
    )
    return [
        searchPost,
        listPosts,
        getDetailPost,
        getPostMetadata,
        listCollections,
        listTags,
        getPostsByCollection,
        fetchSkills
    ];
};

