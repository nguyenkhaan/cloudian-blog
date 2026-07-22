export enum PostStatus {
    PUBLISHED = 'published',
    DRAFT = 'draft',
}

export enum Role {
    ADMIN = 'admin',
    MANAGER = 'manager', // Nhung nguoi quan ly ngay ben duoi quyen admin 
    USER = 'user',
}

export enum ReportStatus {
    SOLVED = 'solved', 
    PENDING = 'pending', 
    CANCEL = 'cancel'
}

export enum AuthProvider {
    LOCAL = 'local', 
    GOOGLE = 'google' 
}

export enum CommentStatus {
    ACTIVE = 'active', 
    INVALID = 'invalid' 
}

export enum ReportEntity {
    COMMENT = 'comment', 
    POST = 'post'
}