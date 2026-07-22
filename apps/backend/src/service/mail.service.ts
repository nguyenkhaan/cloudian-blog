//register / resetPassword / resetEmail / report / subscriber 
import nodemailer from "nodemailer"
import type {AppEnv} from '@/types/env'
export class MailService {
    private transporter 
    private from : string 
    constructor(env : AppEnv["Bindings"]) 
    {
        this.transporter = nodemailer.createTransport({
            host : env.SMTP_HOST || '127.0.0.1', 
            port: Number(env.SMTP_PORT), 
            secure: env.SMTP_SECURE === "true",
            auth: {
                user : env.SMTP_USERNAME || '', 
                pass : env.SMTP_PASSWORD || '' 
            }
        })
        this.from = `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`;
    }
    sendEmail(to : string , subject : string , html : string) 
    {
        return this.transporter.sendMail({
            from: this.from, 
            to, 
            subject, 
            html 
        })
    }
}