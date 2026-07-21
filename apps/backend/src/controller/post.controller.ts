import { AuthMiddleware } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/role.middlware';
import { PostStatus, Role, PostModel } from '@/model';
import {
    CreatePostDto,
    GetAllAdminPostQuery,
    GetAllPostsQuery,
    getDetailPostParam,
    UpdatePostDto,
    UpdatePostParam,
    GetUserPostsQuery,
    UpdatePostStatusDto,
    UpdatePostStatusParam,
    SavePostCollectionsDto,
    SavePostCollectionsParam,
    SavePostTagsDto,
    SavePostTagsParam,
    DeletePostParam,
} from '@/schema/post.schema';
import {
    createPost,
    getAllAdminPosts,
    getAllPost,
    getDetailPost,
    createUploadSignature,
    editPost,
    getUserPosts,
    deletePost,
    updatePostStatus,
    saveCollection,
    saveTag,
} from '@/service/post.service';
import { AppEnv } from '@/types/env';
import { Hono } from 'hono';
import { describeRoute, validator } from 'hono-openapi';
import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';

const route = new Hono<AppEnv>();
const tags = ['Post'];

route.get(
    '/',
    describeRoute({
        summary: 'Get all posts',
        description: 'Get all posts with valid filter',
        tags,
    }),
    validator('query', GetAllPostsQuery),
    async (c) => {
        const data = await c.req.valid('query');
        const db = await c.get('db');
        const response = await getAllPost(db, data);
        return c.json(response);
    }
);

route.get(
    '/admin',
    AuthMiddleware,
    requireRole(Role.ADMIN),
    describeRoute({
        tags,
        summary: 'Get all admin posts',
        description: 'Get all admin posts',
    }),
    validator('query', GetAllAdminPostQuery),
    async (c) => {
        const db = await c.get('db');
        const data = await c.req.valid('query');
        const response = await getAllAdminPosts(db, data);
        return c.json(response);
    }
);

route.get(
    '/me',
    AuthMiddleware,
    describeRoute({
        tags,
        summary: 'Get logged in user posts',
        description: 'Get all posts belonging to the logged-in user',
    }),
    validator('query', GetUserPostsQuery),
    async (c) => {
        const db = await c.get('db');
        const user = c.get('user');
        const userId = Number(user.sub);
        const data = await c.req.valid('query');
        const response = await getUserPosts(db, userId, data);
        return c.json(response);
    }
);

route.get(
    '/:slugOrId',
    describeRoute({
        tags,
        summary: 'Get detail post',
        description: "Get a post's detail by slug or id",
    }),
    validator('param', getDetailPostParam),
    async (c) => {
        const db = await c.get('db');
        const { slugOrId } = await c.req.valid('param');
        const response = await getDetailPost(db, slugOrId);
        return c.json(response);
    }
);

route.post(
    '/',
    AuthMiddleware,
    requireRole(Role.USER),
    describeRoute({
        tags,
        summary: 'Create post',
        description: 'Create a post :))',
    }),
    validator('json', CreatePostDto),
    async (c) => {
        const db = await c.get('db');
        const data = await c.req.valid('json');
        const user = await c.get('user');
        const userId = Number(user.sub);
        const response = await createPost(db, userId, data);
        return c.json(response);
    }
);

route.post(
    '/upload',
    AuthMiddleware,
    requireRole(Role.USER),
    describeRoute({
        tags,
        summary: 'Signature upload',
        description: 'Generate a signature when upload file to cloudinary',
    }),
    async (c) => {
        const apiSecret = c.env.CLOUDINARY_API_SECRET;
        const apiKey = c.env.CLOUDINARY_API_KEY;
        const cloudName = c.env.CLOUDIANRY_CLOUD_NAME;
        const folder = c.env.CLOUDINARY_ROOT_FOLDER;

        const response = await createUploadSignature(
            folder,
            apiSecret,
            apiKey,
            cloudName
        );
        return c.json(response);
    }
);

route.put(
    '/:postId',
    AuthMiddleware,
    requireRole(Role.USER),
    describeRoute({
        tags,
        summary: 'Edit post',
        description: 'Edit post information',
    }),
    validator('param', UpdatePostParam),
    validator('json', UpdatePostDto),
    async (c) => {
        const db = await c.get('db');
        const user = c.get('user');
        const userId = Number(user.sub);
        const { postId } = await c.req.valid('param');
        const data = await c.req.valid('json');
        const response = await editPost(db, userId, Number(postId), data);
        return c.json(response);
    }
);

route.delete(
    '/:postId',
    AuthMiddleware,
    describeRoute({
        tags,
        summary: 'Delete post',
        description: 'Delete a post by ID (Author or ADMIN only)',
    }),
    validator('param', DeletePostParam),
    async (c) => {
        const db = await c.get('db');
        const user = c.get('user');
        const userId = Number(user.sub);
        const userRoles = user.roles ?? [];
        const { postId } = await c.req.valid('param');
        const response = await deletePost(
            db,
            userId,
            userRoles,
            Number(postId)
        );
        return c.json(response);
    }
);

route.patch(
    '/:postId/status',
    AuthMiddleware,
    requireRole(Role.ADMIN),
    describeRoute({
        tags,
        summary: 'Update post status',
        description: 'Update the status of a post (ADMIN only)',
    }),
    validator('param', UpdatePostStatusParam),
    validator('json', UpdatePostStatusDto),
    async (c) => {
        const db = await c.get('db');
        const { postId } = await c.req.valid('param');
        const { status } = await c.req.valid('json');
        const response = await updatePostStatus(db, Number(postId), status);
        return c.json(response);
    }
);

route.put(
    '/:postId/collections',
    AuthMiddleware,
    describeRoute({
        tags,
        summary: 'Save post to collections',
        description:
            'Update the list of collections for a post (Author or ADMIN only)',
    }),
    validator('param', SavePostCollectionsParam),
    validator('json', SavePostCollectionsDto),
    async (c) => {
        const db = await c.get('db');
        const user = c.get('user');
        const userId = Number(user.sub);
        const userRoles = user.roles ?? [];
        const { postId } = await c.req.valid('param');
        const { collectionIds } = await c.req.valid('json');

        const response = await saveCollection(
            db,
            userId,
            userRoles,
            Number(postId),
            collectionIds
        );
        return c.json(response);
    }
);

route.put(
    '/:postId/tags',
    AuthMiddleware,
    describeRoute({
        tags,
        summary: 'Save post tags',
        description:
            'Update the list of tags for a post (Author or ADMIN only)',
    }),
    validator('param', SavePostTagsParam),
    validator('json', SavePostTagsDto),
    async (c) => {
        const db = await c.get('db');
        const user = c.get('user');
        const userId = Number(user.sub);
        const userRoles = user.roles ?? [];
        const { postId } = await c.req.valid('param');
        const { tagIds } = await c.req.valid('json');

        const response = await saveTag(
            db,
            userId,
            userRoles,
            Number(postId),
            tagIds
        );
        return c.json(response);
    }
);

export default route;
