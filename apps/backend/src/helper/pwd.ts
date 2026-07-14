import { hash, compare } from 'bcryptjs';

const SALT = 12;

export async function hashPass(password: string): Promise<string> {
    const hashedPassword = await hash(password, SALT);
    return hashedPassword;
}
export async function comparePass(
    password: string,
    hashedPassword: string
): Promise<Boolean | boolean> {
    const result = await compare(password, hashedPassword);
    return result;
}
