import { AuthMiddleware } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/role.middlware';
import { Role } from '@/model';
import { AppEnv } from '@/types/env';
import { Hono } from 'hono';
import { describeRoute, validator } from 'hono-openapi';
import {
    CreateReportDto,
    UpdateReportDto,
    ReportIdParam,
    UpdateReportStatusDto,
    GetAllReportsQuery,
} from '@/schema/report.schema';
import {
    createReport,
    getAllReports,
    getReportDetails,
    updateReport,
    deleteReport,
    updateReportStatus,
} from '@/service/report.service';

const route = new Hono<AppEnv>();
const tags = ['Report'];


route.get(
    '/',
    AuthMiddleware,
    requireRole(Role.ADMIN),
    describeRoute({
        tags,
        summary: 'Get all reports',
        description: 'Get all reports in the system with optional status or entity type filters',
    }),
    validator('query', GetAllReportsQuery),
    async (c) => {
        const db = await c.get('db');
        const query = await c.req.valid('query');
        const response = await getAllReports(db, query);
        return c.json(response);
    }
);

route.get(
    '/:reportId',
    AuthMiddleware,
    requireRole(Role.ADMIN),
    describeRoute({
        tags,
        summary: 'Get detail report',
        description: 'Get detailed information of a report by ID',
    }),
    validator('param', ReportIdParam),
    async (c) => {
        const db = await c.get('db');
        const { reportId } = await c.req.valid('param');
        const response = await getReportDetails(db, reportId);
        return c.json(response);
    }
);

route.post(
    '/',
    AuthMiddleware,
    requireRole(Role.USER),
    describeRoute({
        tags,
        summary: 'Create report',
        description: 'Submit a report about a post or comment',
    }),
    validator('json', CreateReportDto),
    async (c) => {
        const db = await c.get('db');
        const user = c.get('user');
        const userId = Number(user.sub);
        const data = await c.req.valid('json');
        const response = await createReport(db, userId, data);
        return c.json(response, 201);
    }
);

route.put(
    '/:reportId',
    AuthMiddleware,
    requireRole(Role.USER),
    describeRoute({
        tags,
        summary: 'Edit report content',
        description: 'Edit title or content details of a submitted report',
    }),
    validator('param', ReportIdParam),
    validator('json', UpdateReportDto),
    async (c) => {
        const db = await c.get('db');
        const user = c.get('user');
        const userId = Number(user.sub);
        const { reportId } = await c.req.valid('param');
        const data = await c.req.valid('json');
        const response = await updateReport(db, userId, reportId, data);
        return c.json(response);
    }
);

route.delete(
    '/:reportId',
    AuthMiddleware,
    requireRole(Role.USER),
    describeRoute({
        tags,
        summary: 'Delete a report',
        description: 'Delete a report by ID (owner only)',
    }),
    validator('param', ReportIdParam),
    async (c) => {
        const db = await c.get('db');
        const user = c.get('user');
        const userId = Number(user.sub);
        const { reportId } = await c.req.valid('param');
        const response = await deleteReport(db, userId, reportId);
        return c.json(response);
    }
);

route.post(
    '/:reportId/status',
    AuthMiddleware,
    requireRole(Role.ADMIN),
    describeRoute({
        tags,
        summary: 'Change status',
        description: 'Change report status to solved, pending, or cancel',
    }),
    validator('param', ReportIdParam),
    validator('json', UpdateReportStatusDto),
    async (c) => {
        const db = await c.get('db');
        const { reportId } = await c.req.valid('param');
        const { status } = await c.req.valid('json');
        const response = await updateReportStatus(db, reportId, status);
        return c.json(response);
    }
);

export default route;