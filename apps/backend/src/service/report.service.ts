import { createDb } from '@/db';
import { ReportModel, ReportStatus, ReportEntity, UserModel } from '@/model';
import { MailService } from './mail.service';
import { TemplateService } from './template.service';
import {
    CreateReportDtoType,
    UpdateReportDtoType,
    GetAllReportsQueryType,
} from '@/schema/report.schema';
import { and, desc, eq, SQL } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';

export async function createReport(
    db: ReturnType<typeof createDb>,
    userId: number,
    data: CreateReportDtoType
) {
    try {
        const result = await db
            .insert(ReportModel)
            .values({
                title: data.title,
                content: data.content,
                entity: data.entity,
                userId: userId,
                status: ReportStatus.PENDING,
            })
            .returning({ id: ReportModel.id });

        const created = result[0];
        if (!created) {
            throw new HTTPException(500, {
                message: 'Failed to create report',
            });
        }

        return {
            success: true,
            reportId: created.id,
        };
    } catch (err) {
        console.error('Create report error: ', err);
        throw err;
    }
}

export async function getAllReports(
    db: ReturnType<typeof createDb>,
    query: GetAllReportsQueryType
) {
    try {
        const conditions: SQL[] = [];

        if (query.status !== undefined) {
            conditions.push(eq(ReportModel.status, query.status));
        }
        if (query.entity !== undefined) {
            conditions.push(eq(ReportModel.entity, query.entity));
        }

        const results = await db
            .select({
                id: ReportModel.id,
                title: ReportModel.title,
                content: ReportModel.content,
                status: ReportModel.status,
                entity: ReportModel.entity,
                createdAt: ReportModel.createdAt,
                solvedAt: ReportModel.solved_at,
                user: {
                    id: UserModel.id,
                    name: UserModel.name,
                    nickName: UserModel.nickName,
                    email: UserModel.email,
                },
            })
            .from(ReportModel)
            .innerJoin(UserModel, eq(ReportModel.userId, UserModel.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .limit(query.limit || 10)
            .offset(query.offset || 0)
            .orderBy(desc(ReportModel.createdAt));

        return results;
    } catch (err) {
        console.error('Get all reports error: ', err);
        throw err;
    }
}

export async function getReportDetails(
    db: ReturnType<typeof createDb>,
    reportId: number
) {
    try {
        const report = await db
            .select({
                id: ReportModel.id,
                title: ReportModel.title,
                content: ReportModel.content,
                status: ReportModel.status,
                entity: ReportModel.entity,
                createdAt: ReportModel.createdAt,
                solvedAt: ReportModel.solved_at,
                user: {
                    id: UserModel.id,
                    name: UserModel.name,
                    nickName: UserModel.nickName,
                    email: UserModel.email,
                },
            })
            .from(ReportModel)
            .innerJoin(UserModel, eq(ReportModel.userId, UserModel.id))
            .where(eq(ReportModel.id, reportId))
            .limit(1);

        const result = report[0];
        if (!result) {
            throw new HTTPException(404, {
                message: 'Report not found',
            });
        }

        return result;
    } catch (err) {
        console.error('Get report details error: ', err);
        throw err;
    }
}

export async function updateReport(
    db: ReturnType<typeof createDb>,
    userId: number,
    reportId: number,
    data: UpdateReportDtoType
) {
    try {
        const report = await db.query.ReportModel.findFirst({
            where: eq(ReportModel.id, reportId),
        });

        if (!report) {
            throw new HTTPException(404, {
                message: 'Report not found',
            });
        }

        if (report.userId !== userId) {
            throw new HTTPException(403, {
                message: 'You are not allowed to update this report',
            });
        }

        await db
            .update(ReportModel)
            .set({
                title: data.title || report.title,
                content: data.content || report.content,
            })
            .where(eq(ReportModel.id, reportId));

        return {
            success: true,
        };
    } catch (err) {
        console.error('Update report error: ', err);
        throw err;
    }
}

export async function deleteReport(
    db: ReturnType<typeof createDb>,
    userId: number,
    reportId: number
) {
    try {
        const report = await db.query.ReportModel.findFirst({
            where: eq(ReportModel.id, reportId),
        });

        if (!report) {
            throw new HTTPException(404, {
                message: 'Report not found',
            });
        }

        if (report.userId !== userId) {
            throw new HTTPException(403, {
                message: 'You are not allowed to delete this report',
            });
        }

        await db.delete(ReportModel).where(eq(ReportModel.id, reportId));

        return {
            success: true,
        };
    } catch (err) {
        console.error('Delete report error: ', err);
        throw err;
    }
}

export async function updateReportStatus(
    db: ReturnType<typeof createDb>,
    reportId: number,
    status: ReportStatus,
    mailService: MailService,
    resolutionNote?: string
) {
    try {
        const report = await db.query.ReportModel.findFirst({
            where: eq(ReportModel.id, reportId),
        });

        if (!report) {
            throw new HTTPException(404, {
                message: 'Report not found',
            });
        }

        const solvedAt = status === ReportStatus.PENDING ? null : new Date();

        await db
            .update(ReportModel)
            .set({
                status: status,
                solved_at: solvedAt,
            })
            .where(eq(ReportModel.id, reportId));

        if (status === ReportStatus.SOLVED || status === ReportStatus.CANCEL) {
            const user = await db.query.UserModel.findFirst({
                where: eq(UserModel.id, report.userId),
            });

            if (user) {
                const note = resolutionNote || (status === ReportStatus.SOLVED
                    ? 'Your report has been successfully resolved.'
                    : 'Your report has been closed.');

                const html = TemplateService.reportSolve({
                    name: user.name,
                    reportId: reportId.toString(),
                    reportTitle: report.title,
                    status: status,
                    resolutionNote: note,
                });

                try {
                    await mailService.sendMail(
                        user.email,
                        `Cloudian Blog - Update on Report #${reportId}`,
                        html
                    );
                } catch (mailError) {
                    console.error(`Failed to send report status update email to ${user.email}:`, mailError);
                }
            }
        }

        return {
            success: true,
        };
    } catch (err) {
        console.error('Update report status error: ', err);
        throw err;
    }
}
