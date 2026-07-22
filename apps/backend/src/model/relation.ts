import { relations } from 'drizzle-orm';
import { UserModel } from './user';
import { UserRoleModel } from './userRole';
import { PostModel } from './post';
import { CollectionModel, PostCollectionModel } from './collection';
import { PostTagModel, TagModel } from './tag';
import { ReportModel } from './report';
import { ChatMessageModel } from './chatMessage';
import { ChatSessionModel } from './chatSession';
import { CommentModel } from './comment';
import { OAuthModel } from './provider';

export const UserRelations = relations(UserModel, ({ one, many }) => {
    return {
        roles: many(UserRoleModel),
        posts: many(PostModel),
        reports : many(ReportModel), 
        messages : many(ChatMessageModel), 
        comments: many(CommentModel), 
        oauths: many(OAuthModel)
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
        author: one(UserModel, {
            fields: [PostModel.authorId],
            references: [UserModel.id],
        }),
        postCollections: many(PostCollectionModel),
        postTags: many(PostTagModel),
        comments: many(CommentModel)
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

export const ReportRelations = relations(
    ReportModel, 
    ({ one , many}) => {
        return {
            user: one(UserModel , {
                fields: [ReportModel.userId], 
                references: [UserModel.id]
            })
        }
    }
)

export const ChatMessageRelations = relations(
    ChatMessageModel, 
    ({one , many}) => {
        return {
            user : one(UserModel , {
                fields: [ChatMessageModel.userId], 
                references : [UserModel.id]
            }), 
            session: one(ChatSessionModel , {
                fields : [ChatMessageModel.sessionId], 
                references: [ChatSessionModel.id]
            })
        }

    }
)

export const ChatSessionRelations = relations(
    ChatSessionModel, 
    ({ one , many }) => {
        return {
            messages : many(ChatMessageModel)
        }
    }
)

export const CommentRelations = relations(
    CommentModel, 
    ({ one , many }) => {
        return {
            post: one(PostModel , {
                fields: [CommentModel.postId], 
                references : [PostModel.id]
            }), 
            user: one(UserModel , {
                fields: [CommentModel.userId], 
                references: [UserModel.id]
            })
        }
    }
)

export const OAuthProviderRelations = relations(
    OAuthModel, 
    ({ one , many }) => {
        return {
            user: one(UserModel , {
                fields: [OAuthModel.userId], 
                references : [UserModel.id]
            })
        }
    }
)