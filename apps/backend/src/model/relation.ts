import { relations } from 'drizzle-orm';
import { UserModel } from './user';
import { UserRoleModel } from './userRole';
import { PostModel } from './post';
import { CollectionModel, PostCollectionModel } from './collection';
import { PostTagModel, TagModel } from './tag';

export const UserRelations = relations(UserModel, ({ one, many }) => {
    return {
        roles: many(UserRoleModel),
        posts: many(PostModel),
    };
});

export const UserRoleRelations = relations(UserRoleModel, ({ one, many }) => {
    return {
        user: one(UserModel, {
            fields: [UserRoleModel.userId],
            references: [UserModel.id],
        }),
    };
});

export const PostRelations = relations(PostModel, ({ one, many }) => {
    return {
        user: one(UserModel, {
            fields: [PostModel.authorId],
            references: [UserModel.id],
        }),
        postCollections: many(PostCollectionModel),
        postTags: many(PostTagModel),
    };
});

export const CollectionRelations = relations(
    CollectionModel,
    ({ one, many }) => {
        return {
            postCollections: many(PostCollectionModel),
        };
    }
);

export const PostCollectionRelations = relations(
    PostCollectionModel,
    ({ one, many }) => {
        return {
            post: one(PostModel, {
                fields: [PostCollectionModel.postId],
                references: [PostModel.id],
            }),
            collection: one(CollectionModel, {
                fields: [PostCollectionModel.collectionId],
                references: [CollectionModel.id],
            }),
        };
    }
);

export const TagRelations = relations(TagModel, ({ one, many }) => {
    return {
        postTags: many(PostTagModel),
    };
});

export const TagCollectionRelations = relations(
    PostTagModel,
    ({ one, many }) => {
        return {
            post: one(PostModel, {
                fields: [PostTagModel.postId],
                references: [PostModel.id],
            }),
            tag: one(TagModel, {
                fields: [PostTagModel.tagId],
                references: [TagModel.id],
            }),
        };
    }
);
