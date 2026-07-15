// O day, chung ta se tien hanh xuat ca type va ca object Dto luon. Ben trong zValidator thi se tien hanh truyen vao Dto (oject). Con LoginDtoType de su dung 
//cho cac ham services neu can thiet. 
import { z } from 'zod'

export const LoginDto = z.object({
    email: z.string(), 
    password: z.string().min(8) 
})

export const RegisterDto = z.object({
    email: z.email(), 
    password : z.string().min(8), 
    name: z.string(), 
    nickName: z.string().optional().default('') 
}) 

export const VerifyQuery = z.object({
    code : z.string() 
})
export type RegisterDtoType = z.infer<typeof RegisterDto> 
export type LoginDtoType = z.infer<typeof LoginDto>