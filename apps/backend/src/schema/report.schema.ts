import { ReportEntity, ReportStatus } from '@/model';
import { z } from 'zod';

export const CreateReportDto = z.object({
    title: z.string().min(1, 'Title is required').meta({ example: 'Inappropriate content' }),
    content: z.string().min(1, 'Content is required').meta({ example: 'This post contains offensive language.' }),
    entity: z.nativeEnum(ReportEntity).meta({ example: 'post' }),
});

export const UpdateReportDto = z.object({
    title: z.string().min(1, 'Title is required').optional().meta({ example: 'Updated title' }),
    content: z.string().min(1, 'Content is required').optional().meta({ example: 'Updated content description' }),
});

export const ReportIdParam = z.object({
    reportId: z.coerce.number().meta({ example: '1' }),
});

export const UpdateReportStatusDto = z.object({
    status: z.nativeEnum(ReportStatus).meta({ example: 'solved' }),
});

export const GetAllReportsQuery = z.object({
    limit: z.coerce.number().default(10).optional(),
    offset: z.coerce.number().default(0).optional(),
    status: z.nativeEnum(ReportStatus).optional(),
    entity: z.nativeEnum(ReportEntity).optional(),
});

export type CreateReportDtoType = z.infer<typeof CreateReportDto>;
export type UpdateReportDtoType = z.infer<typeof UpdateReportDto>;
export type UpdateReportStatusDtoType = z.infer<typeof UpdateReportStatusDto>;
export type GetAllReportsQueryType = z.infer<typeof GetAllReportsQuery>;
