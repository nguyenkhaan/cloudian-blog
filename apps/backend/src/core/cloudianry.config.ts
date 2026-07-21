import { v2 as cloudinary } from 'cloudinary';

export function configureCloudinary(
    cloudName: string,
    apiKey: string,
    apiSecret: string
) {
    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
    });

    return cloudinary;
}

export { cloudinary };
