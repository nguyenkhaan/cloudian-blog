import { createDb } from "@/db";
import { CollectionModel, PostCollectionModel, PostModel, PostStatus, PostTagModel, TagModel, UserModel } from "@/model";
import { GetAllAdminPostQueryType, GetAllPostQueryType } from "@/schema/post.schema";
import { and, desc, eq, inArray, SQL } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

export async function getAllPost(db : ReturnType<typeof createDb> , data : GetAllPostQueryType) 
{
    try 
    {
        const conditions : SQL[] = [] 
        if (data.tag && data.tag.length > 0)
            conditions.push(
                inArray(TagModel.name , data.tag)
            )
            
        if (data.collection && data.collection.length > 0) 
            conditions.push(
                inArray(CollectionModel.id , data.collection)
            ) 
        if (data.keyword) 
            conditions.push(
                eq(PostModel.title , data.keyword)
            )
        const results = await db.selectDistinct({
            id : PostModel.id, 
            title : PostModel.title, 
            slug : PostModel.slug, 
            banner: PostModel.banner, 
            publishedAt : PostModel.publishedAt, 
            authorName : UserModel.name, 
            nickName : UserModel.nickName, 
            tagId : TagModel.id, 
            tagSlug : TagModel.slug, 
            tagName : TagModel.name,  
            collectionId : CollectionModel.id, 
            collectionName : CollectionModel.name 
        }).from(PostModel) 
                                .leftJoin(PostTagModel , eq(PostModel.id , PostTagModel.postId))
                                .innerJoin(UserModel , eq(UserModel.id , PostModel.authorId))
                                .leftJoin(TagModel , eq(TagModel.id , PostTagModel.tagId)) 
                                .leftJoin(PostCollectionModel , eq(PostCollectionModel.postId , PostModel.id)) 
                                .leftJoin(CollectionModel , eq(PostCollectionModel.collectionId , CollectionModel.id))
                                .where(
                                    conditions.length > 0 ? and(...conditions , eq(PostModel.status , PostStatus.PUBLISHED)) : undefined
                                )
                                //Chi lay danh sach cac bai viet da duoc xuat ban 
                                .limit(data.limit || 0) 
                                .offset(data.offset || 0)
                                .orderBy(desc(PostModel.publishedAt))
        const map = new Map<number , any>() 
        for (const row of results) 
        {
            if (!map.has(row.id)) 
            {
                map.set(row.id , {
                    id : row.id, 
                    title : row.title, 
                    slug : row.slug, 
                    banner : row.banner, 
                    publishedAt : row.publishedAt, 
                    author : {
                        name : row.authorName, 
                        nickName : row.nickName
                    }, 
                    tags : [], 
                    collections : [] 
                })
            }
            const post = map.get(row.id) 
            //Adding tag to the post , maybe english is well - Ark One
            if (row.tagId && !post.tags.some((t: any) => t.id === row.tagId))
            {
                post.tags.push({
                    id : row.tagId, 
                    name : row.tagName, 
                    slug : row.tagSlug
                })
            } 
            //Adding collections information to the post, maybe english is well - Ark One
            if (row.collectionId && !post.collections.some((t : any) => t.id === row.collectionId))
            {
                post.collections.push({
                    id : row.collectionId, 
                    name : row.collectionName 
                })
            }
        }
        return [...map.values()]
    } 
    catch (err) 
    {
        console.log("Get all posts error: " , err) 
        throw err 
    }
}

export async function getAllAdminPosts(db : ReturnType<typeof createDb> , data : GetAllAdminPostQueryType) 
{
    try 
    {
        const posts = await db.query.PostModel.findMany({
            columns: {
                id : true, 
                title : true, 
                status : true, 
                slug : true, 
                createdAt : true 
            }, 
            where: eq(PostModel.status , data.status), 
            limit : data.limit || 10,  
            offset : data.offset || 0
        })
        return posts 
    } 
    catch (err) 
    {
        console.log("Get all admin posts error: " , err) 
        throw err 
    }
}

export async function getDetailPost(db : ReturnType<typeof createDb> , slugOrId : string) 
{
    try 
    {
        
        const condition = (isNaN(Number(slugOrId)) ? () => eq(PostModel.slug , slugOrId) : () => eq(PostModel.id , Number(slugOrId))) 
        const post = await db.query.PostModel.findFirst({
            columns: {
                id : true, 
                title : true, 
                content : true, 
                slug : true, 
                status : true, 
            },  
            with: {
                author: {
                    columns: { name : true }
                }, 
                postTags : {
                    with: {
                        tag : {
                            columns: { id : true , name : true }
                        }
                    }
                }, 
                postCollections: {
                    with: {
                        collection: {
                            columns : {id : true , name : true}
                        }
                    }
                }
            }, 
            where: condition() 
        })
        if (!post) 
            throw new HTTPException(
                404, {
                    message: "Post not found" 
                }
            )
        const { postTags , postCollections , ...postData } = post 
       const result = {
            ...postData, 
            collections : postCollections.map(v => ({ id : v.collection?.id , name : v.collection?.name  })), 
            tags : postTags.map(v => ({ id : v.tag?.id , name : v.tag?.name }))
       }
       return result
    } 
    catch (err) 
    {
        console.log("Get detail post error: " , err) 
        throw err 
    }
}