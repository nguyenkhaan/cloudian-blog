# Spec: Email Change Flow

## Objective

Thiết kế lại luồng đổi email cho người dùng theo hướng self-service, nhưng vẫn an toàn và không phụ thuộc vào password cũ.

### Mục tiêu chính

- Người dùng có thể tự yêu cầu đổi email ngay trong profile.
- Tài khoản đăng nhập bằng Google vẫn đổi email được, dù không có password.
- Email cũ vẫn được giữ nguyên cho tới khi xác minh hoàn tất.
- Xác minh ưu tiên qua email cũ, fallback qua email mới nếu người dùng không còn truy cập email cũ.
- Admin chỉ là phương án dự phòng cuối cùng, không phải luồng chính.

### Hành vi mong muốn

1. User nhập email mới trong profile.
2. Hệ thống tạo yêu cầu đổi email ở trạng thái pending.
3. User vẫn tiếp tục dùng email cũ cho đến khi xác minh thành công.
4. Hệ thống gửi link xác minh tới email cũ.
5. Nếu user không còn truy cập email cũ, có thể chuyển sang xác minh bằng email mới.
6. Khi một trong hai email được xác minh thành công, backend mới cập nhật `user.email`.
7. Sau khi xác minh thành công, user được thông báo rằng email mới đã được kích hoạt.

### Out of scope

- Không ép user nhập password hiện tại để đổi email.
- Không chuyển admin thành luồng đổi email mặc định.
- Không cập nhật email ngay khi user submit form.
- Không đổi sang cơ chế nhiều bước phức tạp hơn mức cần thiết cho hiện tại.

## Current Problems

- Luồng hiện tại dựa trên password confirm, gây lỗi với user login bằng Google.
- Backend đã bị chỉnh sang admin-only change email, nhưng điều đó phá vỡ self-service.
- UI hiện tại đang có dấu hiệu tách giữa change email và verify change email, nhưng logic chưa thống nhất.
- Người dùng có thể bị rơi vào trạng thái lưng chừng nếu email bị đổi trước khi xác minh xong.

## Proposed Solution

### Decision 1: Giữ email cũ cho tới khi verify xong

Khi user submit email mới, backend chỉ lưu một request pending, không sửa `user.email` ngay.

### Decision 2: Two-step verification

- Primary path: gửi xác minh tới email cũ.
- Fallback path: nếu user không còn truy cập email cũ, gửi xác minh tới email mới.
- Chỉ khi một trong hai link được verify thì request mới được commit.

### Decision 3: Admin only as last resort

Admin chỉ can thiệp khi:

- user mất cả email cũ lẫn email mới,
- token hết hạn nhiều lần,
- hoặc cần xử lý tranh chấp / support case đặc biệt.

### Decision 4: Không bắt password cũ

Password không còn là điều kiện bắt buộc cho email change. Điều này giữ cho Google-only account vẫn đổi email được.

## Tech Stack

- Frontend: React 19, Vite, React Router, Axios
- Backend: Hono, Cloudflare Workers, D1, Drizzle, Zod
- Email delivery: Nodemailer templates hiện có
- Auth: JWT access/refresh token + verify token

## Commands

### Frontend

- Dev: `bun --cwd apps/frontend run dev`
- Build: `bun --cwd apps/frontend run build`
- Lint: `bun --cwd apps/frontend run lint`

### Backend

- Dev: `bun --cwd apps/backend run dev`
- Build: `bun --cwd apps/backend run deploy`
- Migrations: `bun --cwd apps/backend run migrate`

### Workspace

- Format: `bun run format`

## Project Structure

### Likely backend files

- `apps/backend/src/controller/auth.controller.ts`
- `apps/backend/src/service/auth.service.ts`
- `apps/backend/src/schema/auth.schema.ts`
- `apps/backend/src/template/reset-email.ts`
- `apps/backend/src/template/verify-register.ts`
- `apps/backend/src/types/env.ts`

### Likely frontend files

- `apps/frontend/src/api/auth.ts`
- `apps/frontend/src/pages/Dashboard.tsx`
- `apps/frontend/src/components/dashboard/DashboardProfile.tsx`
- `apps/frontend/src/components/ui/ConfirmModal.tsx`
- `apps/frontend/src/pages/Verify.tsx`

### Possible data model additions

- A new pending email change record
- Or an equivalent token-based tracking field on the user record if the schema is kept minimal

## Code Style

- Prefer explicit, small DTOs over implicit request objects.
- Keep backend validation in Zod and route handlers thin.
- Keep email template rendering in the template layer, not inline in controllers.
- Keep frontend forms optimistic only where the backend contract is already clear.

```ts
// Good pattern: controller only validates and delegates
route.post(
  '/change-email',
  AuthMiddleware,
  validator('json', ChangeEmailRequestDto),
  async (c) => {
    const db = await c.get('db');
    const data = await c.req.valid('json');
    const mailService = new MailService(c.env);
    const response = await requestEmailChange(db, c.get('user').id, data, c.env.FE_URL, mailService);
    return c.json(response);
  }
);
```

## Testing Strategy

### Backend

- Validate request schemas for:
  - pending change request creation
  - verify via old email
  - verify via new email fallback
  - admin override path
- Add service tests for:
  - email stays unchanged until verification
  - token mismatch is rejected
  - duplicate pending requests are handled cleanly

### Frontend

- Verify profile form no longer assumes password is mandatory for email change.
- Verify success and error states in the email change flow.
- Verify `/verify` or a dedicated change-email verification route can complete the flow.

### Manual checks

- Google user can request email change without password.
- Email remains old until verification is complete.
- Verification link from old email works.
- Fallback verification from new email works.
- Admin fallback does not break the normal flow.

## Boundaries

- Always:
  - Keep old email active until verify succeeds.
  - Send a notification email whenever a pending change is created.
  - Validate the new email format and reject duplicates.
  - Preserve existing login/session behavior during the pending state.
- Ask first:
  - Adding a new table or migration for pending email changes.
  - Changing auth token lifetime or verification token strategy.
  - Modifying admin permission rules.
- Never:
  - Require password as the only verification path.
  - Mutate the user email before verification is complete.
  - Remove the admin fallback entirely.

## Success Criteria

- User can request email change from profile without entering password.
- Google-login users can complete the flow.
- Email cũ remains active until verification.
- Verification works from either the old email or the new email.
- Admin can still override only as a last-resort recovery path.
- Existing auth/login flows continue to work after the change.

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| User loses access to both inboxes | High | Keep admin override for support cases only |
| Pending change gets applied too early | High | Commit email only after verification succeeds |
| Duplicate or stale requests create confusion | Medium | Store one active request per user and invalidate older tokens |
| Frontend and backend route names drift | Medium | Keep one shared contract in this document before coding |

## Open Questions

- Should the pending change use a dedicated table or be encoded in JWT/token only?
- Should the fallback to new email happen automatically or only after the user clicks a “I can’t access my old email” action?
- Should the verification route stay on `/verify` with a mode flag, or use a dedicated `/verify-email-change` path?

## Implementation Plan

### Phase 1: Contract and data flow

- [ ] Define the exact contract for requesting an email change.
- [ ] Decide the token/persistence strategy for pending requests.
- [ ] Align route names and query params for verify vs. verify-email-change.

### Phase 2: Backend request and verification flow

- [ ] Add backend support for creating a pending email change request.
- [ ] Send verification mail to the old email first.
- [ ] Add fallback verification using the new email.
- [ ] Commit the email update only after verification succeeds.

### Phase 3: Frontend profile UX

- [ ] Remove password as a required field for email change.
- [ ] Add explanatory UI for old-email primary verification and new-email fallback.
- [ ] Surface success/error states clearly in the profile page.

### Phase 4: Admin fallback and regression checks

- [ ] Keep admin override available for support recovery.
- [ ] Verify Google-login users can complete the flow.
- [ ] Verify legacy login users still work after email change.
- [ ] Confirm no other auth flows regress.

### Checkpoint: Contract locked

- [ ] Requirements match the confirmed intent.
- [ ] Backend/frontend route contract is stable.
- [ ] No implementation started before the contract is approved.

### Checkpoint: Core flow works

- [ ] User can request change.
- [ ] Email stays unchanged until verify.
- [ ] Verification completes from old or new email.

### Checkpoint: Complete

- [ ] Admin fallback remains intact.
- [ ] Build and verification steps pass.
- [ ] The flow is ready for implementation.
