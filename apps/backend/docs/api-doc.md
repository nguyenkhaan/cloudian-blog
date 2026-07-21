# Cloudian Blog - API Documentation

This document outlines all current and planned API routes to support the frontend application.

---

## 🔒 Authentication (`/api/auth`)

### 1. Register Account

- **Route:** `POST /api/auth/register`
- **Công dụng:** Đăng ký tài khoản người dùng mới.
- **Request:**
    - **Body (JSON):**
        ```json
        {
            "email": "user@example.com",
            "password": "Password123!",
            "name": "Nguyen Van A",
            "nickName": "nva"
        }
        ```
- **Response:**
    - **Status:** `200 OK`
    - **Body:**
        ```json
        {
            "user": {
                "id": 1,
                "email": "user@example.com",
                "name": "Nguyen Van A",
                "nickName": "nva"
            },
            "verifyToken": "jwt_verify_token_here"
        }
        ```

### 2. Verify Account

- **Route:** `GET /api/auth/verify`
- **Công dụng:** Xác thực tài khoản sau khi đăng ký qua email.
- **Request:**
    - **Query Params:** `code=jwt_verify_token_here`
- **Response:**
    - **Status:** `200 OK`
    - **Body (Text):** `"User account has been active"`

### 3. Login

- **Route:** `POST /api/auth/login`
- **Công dụng:** Đăng nhập hệ thống để nhận Access Token và Refresh Token.
- **Request:**
    - **Body (JSON):**
        ```json
        {
            "email": "user@example.com",
            "password": "Password123!"
        }
        ```
- **Response:**
    - **Status:** `200 OK`
    - **Body:**
        ```json
        {
            "accessToken": "access_jwt_token",
            "refreshToken": "refresh_jwt_token"
        }
        ```

### 4. Refresh Token

- **Route:** `POST /api/auth/refresh`
- **Công dụng:** Dùng Refresh Token để lấy Access Token mới khi hết hạn.
- **Request:**
    - **Body (JSON):** `{ "token": "refresh_jwt_token" }`
- **Response:**
    - **Status:** `200 OK`
    - **Body:** `{ "accessToken": "new_access_jwt_token" }`

### 5. Forgot Password

- **Route:** `GET /api/auth/forgot-password`
- **Công dụng:** Yêu cầu mã token khôi phục mật khẩu qua email.
- **Request:**
    - **Query Params:** `email=user@example.com`
- **Response:**
    - **Status:** `200 OK`
    - **Body:** `{ "token": "reset_token_here" }`

### 6. Change Password (Reset)

- **Route:** `POST /api/auth/change-password`
- **Công dụng:** Đổi mật khẩu mới sử dụng reset token.
- **Request:**
    - **Query Params:** `token=reset_token_here`
    - **Body (JSON):** `{ "password": "NewPassword123!" }`
- **Response:**
    - **Status:** `200 OK`
    - **Body (Text):** `"Password has been reset"`

### 7. Request Change Email

- **Route:** `POST /api/auth/change-email`
- **Công dụng:** Yêu cầu đổi email (Yêu cầu đăng nhập).
- **Request:**
    - **Headers:** `Authorization: Bearer <access_token>`
    - **Body (JSON):** `{ "password": "CurrentPassword123!", "email": "new_email@example.com" }`
- **Response:**
    - **Status:** `200 OK`
    - **Body:** `{ "token": "verify_change_email_token" }`

### 8. Verify Change Email

- **Route:** `GET /api/auth/verify-change-email`
- **Công dụng:** Xác thực thay đổi email bằng link chứa token.
- **Request:**
    - **Query Params:** `token=verify_change_email_token`
- **Response:**
    - **Status:** `200 OK`
    - **Body (Text):** `"Account's email has been reset successfully"`

---

## 📝 Posts (`/api/posts`)

### 1. Get Public Posts

- **Route:** `GET /api/posts`
- **Công dụng:** Lấy danh sách bài viết đã xuất bản (dành cho độc giả, hỗ trợ tìm kiếm, lọc theo Tag/Collection và phân trang).
- **Request:**
    - **Query Params:** `page=1&limit=10&search=keyword&tagId=2&collectionName=Programming`
- **Response:**
    - **Status:** `200 OK`
    - **Body:**
        ```json
        {
            "posts": [
                {
                    "id": 1,
                    "title": "Introduce Hono",
                    "slug": "introduce-hono",
                    "banner": "https://example.com/banner.png",
                    "publishedAt": 1721389400,
                    "author": { "name": "Admin", "nickName": "admin" },
                    "tags": [{ "id": 1, "name": "Tech" }],
                    "collections": [{ "id": 1, "name": "Frameworks" }]
                }
            ],
            "pagination": { "page": 1, "limit": 10, "total": 1 }
        }
        ```

### 2. Get Admin/Author Posts

- **Route:** `GET /api/posts/admin`
- **Công dụng:** Quản lý tất cả bài viết (cả nháp và xuất bản - yêu cầu đăng nhập Admin/Author).
- **Request:**
    - **Headers:** `Authorization: Bearer <access_token>`
    - **Query Params:** `page=1&limit=10&status=draft`
- **Response:**
    - **Status:** `200 OK`
    - **Body:**
        ```json
        {
            "posts": [
                {
                    "id": 2,
                    "title": "Draft Post",
                    "status": "draft",
                    "createdAt": 1721389400
                }
            ],
            "pagination": { "page": 1, "limit": 10, "total": 1 }
        }
        ```

### 3. Get Post Details

- **Route:** `GET /api/posts/:slug-or-id`
- **Công dụng:** Lấy nội dung chi tiết bài viết (bằng ID hoặc slug). Slug không nên cho toàn chữ số mà bắt buộc phải có chữ cái vào
- **Request:** Không yêu cầu body.
- **Response:**
    - **Status:** `200 OK`
    - **Body:**
        ```json
        {
            "id": 1,
            "title": "Introduce Hono",
            "content": "Full markdown content here...",
            "slug": "introduce-hono",
            "status": "published",
            "author": { "name": "Admin" },
            "tags": [{ "id": 1, "name": "Tech" }],
            "collections": [{ "id": 1, "name": "Frameworks" }]
        }
        ```

### 4. Create Post

- **Route:** `POST /api/posts`
- **Công dụng:** Tạo bài viết mới (mặc định trạng thái draft - yêu cầu đăng nhập).
- **Request:**
    - **Headers:** `Authorization: Bearer <access_token>`
    - **Body (JSON):**
        ```json
        {
            "title": "My New Blog Post",
            "content": "This is content...",
            "banner": "https://example.com/banner.png",
            "tagIds": [1, 2],
            "collectionIds": [1]
        }
        ```
- **Response:**
    - **Status:** `201 Created`
    - **Body:** `{ "success": true, "postId": 3, "slug": "my-new-blog-post" }`

### 5. Update Post

- **Route:** `PUT /api/posts/:id`
- **Công dụng:** Cập nhật thông tin/nội dung bài viết (yêu cầu đăng nhập, là tác giả hoặc admin).
- **Request:**
    - **Headers:** `Authorization: Bearer <access_token>`
    - **Body (JSON):**
        ```json
        {
            "title": "Updated Title",
            "content": "Updated content...",
            "banner": "https://example.com/new-banner.png",
            "tagIds": [1],
            "collectionIds": [1, 2]
        }
        ```
- **Response:**
    - **Status:** `200 OK`
    - **Body:** `{ "success": true }`

### 6. Delete Post

- **Route:** `DELETE /api/posts/:id`
- **Công dụng:** Xóa bài viết (yêu cầu đăng nhập, là tác giả hoặc admin).
- **Request:**
    - **Headers:** `Authorization: Bearer <access_token>`
- **Response:**
    - **Status:** `200 OK`
    - **Body:** `{ "success": true }`

### 7. Change Post Status (Publish/Draft)

- **Route:** `PATCH /api/posts/:id/status`
- **Công dụng:** Thay đổi trạng thái bài viết (Yêu cầu đăng nhập, quyền admin hoặc tác giả).
- **Request:**
    - **Headers:** `Authorization: Bearer <access_token>`
    - **Body (JSON):** `{ "status": "published" }` // Hoặc "draft"
- **Response:**
    - **Status:** `200 OK`
    - **Body:** `{ "success": true, "status": "published" }`

---

## 📂 Collections (`/api/collections`)

### 1. Get All Collections

- **Công dụng:** Lấy danh sách toàn bộ chuyên mục (kèm số lượng bài viết).
- **Request:** Không yêu cầu body.
- **Response:**
    - **Status:** `200 OK`
    - **Body:**
        ```json
        [
            {
                "id": 1,
                "name": "Programming",
                "description": "Guides about code",
                "thumbnail": "https://example.com/thumb.png",
                "postCount": 12
            }
        ]
        ```

### 2. Get Collection Details

- **Route:** `GET /api/collections/:id`
- **Công dụng:** Lấy thông tin chuyên mục và danh sách bài viết thuộc chuyên mục đó.
- **Request:** Không yêu cầu body.
- **Response:**
    - **Status:** `200 OK`
    - **Body:**
        ```json
        {
            "id": 1,
            "name": "Programming",
            "description": "Guides about code",
            "posts": [
                { "id": 1, "title": "Introduce Hono", "slug": "introduce-hono" }
            ]
        }
        ```

### 3. Create Collection

- **Route:** `POST /api/collections`
- **Công dụng:** Tạo mới chuyên mục (Yêu cầu đăng nhập Admin).
- **Request:**
    - **Headers:** `Authorization: Bearer <access_token>`
    - **Body (JSON):**
        ```json
        {
            "name": "New Collection",
            "description": "Description of collection",
            "thumbnail": "https://example.com/thumb.png"
        }
        ```
- **Response:**
    - **Status:** `201 Created`
    - **Body:** `{ "success": true, "collectionId": 2 }`

### 4. Update Collection

- **Route:** `PUT /api/collections/:id`
- **Công dụng:** Sửa thông tin chuyên mục (Yêu cầu đăng nhập Admin).
- **Request:**
    - **Headers:** `Authorization: Bearer <access_token>`
    - **Body (JSON):**
        ```json
        {
            "name": "Updated Name",
            "description": "Updated description",
            "thumbnail": "https://example.com/new-thumb.png"
        }
        ```
- **Response:**
    - **Status:** `200 OK`
    - **Body:** `{ "success": true }`

### 5. Delete Collection

- **Route:** `DELETE /api/collections/:id`
- **Công dụng:** Xóa chuyên mục (Yêu cầu đăng nhập Admin).
- **Request:**
    - **Headers:** `Authorization: Bearer <access_token>`
- **Response:**
    - **Status:** `200 OK`
    - **Body:** `{ "success": true }`

---

## 🏷️ Tags (`/api/tags`)

### 1. Get All Tags

- **Route:** `GET /api/tags`
- **Công dụng:** Lấy toàn bộ danh sách các nhãn tag hiện có.
- **Request:** Không yêu cầu body.
- **Response:**
    - **Status:** `200 OK`
    - **Body:**
        ```json
        [{ "id": 1, "name": "React", "slug": "react" }]
        ```

### 2. Create Tag

- **Route:** `POST /api/tags`
- **Công dụng:** Tạo nhãn bài viết mới (Yêu cầu đăng nhập).
- **Request:**
    - **Headers:** `Authorization: Bearer <access_token>`
    - **Body (JSON):** `{ "name": "React", "slug": "react" }`
- **Response:**
    - **Status:** `201 Created`
    - **Body:** `{ "success": true, "tagId": 1 }`

### 3. Delete Tag

- **Route:** `DELETE /api/tags/:id`
- **Công dụng:** Xóa nhãn tag (Yêu cầu đăng nhập Admin).
- **Request:**
    - **Headers:** `Authorization: Bearer <access_token>`
- **Response:**
    - **Status:** `200 OK`
    - **Body:** `{ "success": true }`

---

## 📧 Subscribers (`/api/subscribers`)

### 1. Subscribe to Newsletter

- **Route:** `POST /api/subscribers`
- **Công dụng:** Người dùng đăng ký nhận bản tin qua email (Public).
- **Request:**
    - **Body (JSON):**
        ```json
        {
            "email": "subscriber@example.com",
            "name": "Nguyen Van B"
        }
        ```
- **Response:**
    - **Status:** `201 Created`
    - **Body:** `{ "success": true, "message": "Subscribed successfully" }`

### 2. Get All Subscribers

- **Route:** `GET /api/subscribers`
- **Công dụng:** Lấy danh sách những người đăng ký (Yêu cầu đăng nhập Admin).
- **Request:**
    - **Headers:** `Authorization: Bearer <access_token>`
- **Response:**
    - **Status:** `200 OK`
    - **Body:**
        ```json
        [{ "id": 1, "email": "subscriber@example.com", "name": "Nguyen Van B" }]
        ```

### 3. Unsubscribe

- **Route:** `DELETE /api/subscribers/:id`
- **Công dụng:** Hủy đăng ký nhận tin (Public hoặc Admin xóa).
- **Request:** Không yêu cầu body.
- **Response:**
    - **Status:** `200 OK`
    - **Body:** `{ "success": true, "message": "Unsubscribed successfully" }`
