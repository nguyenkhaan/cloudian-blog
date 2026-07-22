import nodemailer from 'nodemailer';
import type { AppEnv } from '@/types/env';

export class MailService {
    private transporter: any;
    private from: string;

    constructor(env: AppEnv['Bindings']) {
        this.transporter = nodemailer.createTransport({
            host: env.SMTP_HOST || '',
            port: Number(env.SMTP_PORT || 587),
            secure: env.SMTP_SECURE === 'true',
            auth: {
                user: env.SMTP_USERNAME || '',
                pass: env.SMTP_PASSWORD || '',
            },
        });
        this.from = `"${env.SMTP_FROM_NAME || 'Cloudian Blog'}" <${env.SMTP_FROM_EMAIL || 'noreply@cloudianblog.com'}>`;
    }

    public async sendMail(to: string, subject: string, html: string): Promise<any> {
        try {
            const info = await this.transporter.sendMail({
                from: this.from,
                to,
                subject,
                html,
            });
            console.log(`Email successfully sent to ${to}: ${info.messageId}`);
            return info;
        } catch (error) {
            console.error(`Failed to send email to ${to}:`, error);
            throw error;
        }
    }
}