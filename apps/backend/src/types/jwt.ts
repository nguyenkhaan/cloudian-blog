import { extend } from "zod/mini";
import { JWTPayload } from 'hono/utils/jwt/types';
import { Role } from "@/model/base";

export interface AccessJwtPayload extends JWTPayload {
    sub: string 
    roles: Role[], 
}