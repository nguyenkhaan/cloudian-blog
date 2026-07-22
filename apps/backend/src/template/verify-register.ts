export default function verifyRegisterTemplate(data: {
    name: string;
    verificationUrl: string;
    validMinutes?: number;
}) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Account</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            width: 100% !important;
            height: 100% !important;
            background-color: #f8fafc;
            color: #0f172a;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
        }
        table {
            border-collapse: collapse;
            width: 100%;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
        }
        .header {
            padding: 32px 32px 24px 32px;
            border-bottom: 1px solid #e2e8f0;
        }
        .brand {
            color: #1d4ed8;
            font-size: 20px;
            font-weight: 700;
            letter-spacing: -0.02em;
            text-decoration: none;
        }
        .content {
            padding: 32px;
        }
        .title {
            margin-top: 0;
            margin-bottom: 20px;
            color: #0f172a;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: -0.03em;
        }
        .greeting {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 16px;
        }
        .text {
            color: #475569;
            margin-bottom: 24px;
            max-width: 520px;
        }
        .cta-container {
            margin-bottom: 28px;
        }
        .btn {
            display: inline-block;
            background-color: #1d4ed8;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 24px;
            font-weight: 600;
            font-size: 15px;
            border-radius: 4px;
            text-align: center;
        }
        .btn:hover {
            background-color: #1e40af;
        }
        .meta-text {
            font-size: 13px;
            color: #64748b;
            margin-top: 24px;
            border-top: 1px solid #f1f5f9;
            padding-top: 16px;
        }
        .link-fallback {
            word-break: break-all;
            color: #1d4ed8;
            text-decoration: underline;
        }
        .footer {
            padding: 24px 32px;
            background-color: #f8fafc;
            border-top: 1px solid #e2e8f0;
            border-radius: 0 0 4px 4px;
            font-size: 13px;
            color: #64748b;
            text-align: center;
        }
    </style>
</head>
<body>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center">
                <div class="container">
                    <div class="header" align="left">
                        <a href="#" class="brand">Cloudian Blog</a>
                    </div>
                    <div class="content" align="left">
                        <h1 class="title">Verify your email address</h1>
                        <p class="greeting">Hi ${data.name},</p>
                        <p class="text">
                            Thank you for signing up for Cloudian Blog! Please verify your email address by clicking the button below to active your account.
                        </p>
                        <div class="cta-container">
                            <a href="${data.verificationUrl}" class="btn" target="_blank">Verify Account</a>
                        </div>
                        <p class="text">
                            If you did not sign up for this account, you can safely ignore this email.
                        </p>
                        <div class="meta-text">
                            If the button doesn't work, copy and paste this URL into your browser:<br>
                            <a href="${data.verificationUrl}" class="link-fallback" target="_blank">${data.verificationUrl}</a>
                            ${
                                data.validMinutes
                                    ? `<br><br>This link will expire in ${data.validMinutes} minutes.`
                                    : ''
                            }
                        </div>
                    </div>
                    <div class="footer">
                        &copy; 2026 Cloudian Blog. All rights reserved.
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`;
}