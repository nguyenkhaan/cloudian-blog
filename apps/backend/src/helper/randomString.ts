export function generateRandomString(length = 8): string {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    const randomValues = crypto.getRandomValues(new Uint32Array(length));

    let result = "";

    for (const value of randomValues) {
        result += chars.charAt(value % chars.length);
    }

    return result;
}