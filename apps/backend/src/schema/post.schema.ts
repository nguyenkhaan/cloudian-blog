import { PostStatus } from "@/model";
import { z } from "zod";


export const GetAllPostsQuery = z.object({
    limit: z.coerce.number().default(0).optional(), 
    offset: z.coerce.number().default(10).optional(), 
    tag: z.string().transform((v) => v.split(",")).optional(), 
    keyword: z.string().optional(), 
    collection: z.string().transform((v) => v.split(",").map((v) => Number(v))).optional() 
})

export const GetAllAdminPostQuery = z.object({
    limit : z.coerce.number().default(10).optional(), 
    offset : z.coerce.number().default(0).optional(), 
    status : z.enum(PostStatus).optional().default(PostStatus.PUBLISHED)
})

export const getDetailPostParam = z.object({
    slugOrId : z.string()
})

export type GetAllPostQueryType = z.infer<typeof GetAllPostsQuery>
export type GetAllAdminPostQueryType = z.infer<typeof GetAllAdminPostQuery>