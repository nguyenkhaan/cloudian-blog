import verifyRegisterTemplate from '@/template/verify-register';
import reportSolveTemplate from '@/template/report-solve';
import resetEmailTemplate from '@/template/reset-email';
import resetPasswordTemplate from '@/template/reset-password';
import subscriberTemplate from '@/template/subscriber';

export class TemplateService {
    static verifyRegister(data: {
        name: string;
        verificationUrl: string;
        validMinutes: number;
    }) {
        return verifyRegisterTemplate(data);
    }
    static reportSolve(data: {
        name: string;
        reportId: string;
        reportTitle: string;
        status: string;
        resolutionNote: string;
    }) {
        return reportSolveTemplate(data);
    }
    static resetPassword(data: {
        name: string;
        resetUrl: string;
        validMinutes: number;
    }) {
        return resetPasswordTemplate(data);
    }
    static resetEmail(data: {
        name: string;
        newEmail: string;
        resetUrl: string;
        validMinutes: number;
    }) {
        return resetEmailTemplate(data);
    }
    static subscriber(data: {
        name: string;
        unsubscribeUrl: string;
        recentPosts: { title: string; url: string }[];
    }) {
        return subscriberTemplate(data);
    }
}