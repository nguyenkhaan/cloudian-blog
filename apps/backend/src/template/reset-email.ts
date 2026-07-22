export default function resetEmailTemplate(data: {
    name: string;
    newEmail: string;
    resetUrl: string;
    validMinutes?: number;
}) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Email Address Change</title>
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
        .email-badge {
            background-color: #f1f5f9;
            color: #0f172a;
            padding: 4px 8px;
            font-family: monospace;
            font-size: 14px;
            border-radius: 4px;
            border: 1px solid #e2e8f0;
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
                        <h1 class="title">Confirm email address change</h1>
                        <p class="greeting">Hi ${data.name},</p>
                        <p class="text">
                            We received a request to change the email address for your Cloudian Blog account to:<br>
                            <span class="email-badge">${data.newEmail}</span>
                        </p>
                        <p class="text">
                            Please click the button below to verify this new email address and complete the change.
                        </p>
                        <div class="cta-container">
                            <a href="${data.resetUrl}" class="btn" target="_blank">Confirm Email Change</a>
                        </div>
                        <p class="text">
                            If you did not request this change, you can ignore this email. Your account will continue to use your current email address.
                        </p>
                        <div class="meta-text">
                            If the button doesn't work, copy and paste this URL into your browser:<br>
                            <a href="${data.resetUrl}" class="link-fallback" target="_blank">${data.resetUrl}</a>
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