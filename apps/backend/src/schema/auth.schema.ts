// O day, chung ta se tien hanh xuat ca type va ca object Dto luon. Ben trong zValidator thi se tien hanh truyen vao Dto (oject). Con LoginDtoType de su dung 
//cho cac ham services neu can thiet. 
import { z } from 'zod'

export const LoginDto = z.object({
    email: z.string().meta({ example: 'cloudian@gmail.com' }), 
    password: z.string().min(8).meta({ example: '1234567890' })
})

export const RegisterDto = z.object({
    email: z.email().meta({ example: 'cloudian@gmail.com' }), 
    password : z.string().min(8).meta({ example : '1234567890' }), 
    name: z.string().meta({ example: 'cloudian' }), 
    nickName: z.string().optional().default('').meta({ example: 'cloudian' })
}) 

export const VerifyQuery = z.object({
    code : z.string().meta({
        example: 'abcxyz...', 
        description: 'Verification code'
    })
})

export const ForgotPasswordQuery = z.object({
    email: z.email().meta({
        example: 'cloudian@gmail.com'
    })
})

export const ChangePasswordDto = z.object({
    password : z.string().min(8).meta({
        example: 'cloudian123'
    })
})

export const ChangePasswordQuery = z.object({
    token: z.string().meta({
        example: "cloudian123"
    })
})
export type ChangePasswordType = z.infer<typeof ChangePasswordDto>
export type RegisterDtoType = z.infer<typeof RegisterDto> 
export type LoginDtoType = z.infer<typeof LoginDto>