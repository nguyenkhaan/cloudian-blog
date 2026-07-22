export default function reportSolveTemplate(data: {
    name: string;
    reportId: string;
    reportTitle: string;
    status: string;
    resolutionNote?: string;
}) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Report Update</title>
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
        .summary-card {
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 20px;
            background-color: #f8fafc;
            margin-bottom: 24px;
        }
        .summary-title {
            font-size: 14px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 12px;
            margin-top: 0;
        }
        .summary-item {
            margin-bottom: 12px;
        }
        .summary-label {
            font-weight: 600;
            color: #334155;
            display: inline-block;
            width: 100px;
        }
        .summary-val {
            color: #0f172a;
        }
        .badge {
            display: inline-block;
            padding: 2px 8px;
            font-size: 13px;
            font-weight: 600;
            border-radius: 4px;
            text-transform: uppercase;
        }
        .badge-solved {
            background-color: #dcfce7;
            color: #15803d;
            border: 1px solid #bbf7d0;
        }
        .badge-cancel {
            background-color: #fee2e2;
            color: #b91c1c;
            border: 1px solid #fecaca;
        }
        .badge-pending {
            background-color: #fef9c3;
            color: #a16207;
            border: 1px solid #fef08a;
        }
        .note-card {
            border-top: 1px solid #e2e8f0;
            padding-top: 16px;
            margin-top: 16px;
        }
        .note-title {
            font-weight: 600;
            color: #334155;
            margin-bottom: 6px;
        }
        .note-body {
            color: #475569;
            font-style: italic;
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
                        <h1 class="title">Update on Your Report</h1>
                        <p class="greeting">Hi ${data.name},</p>
                        <p class="text">
                            Thank you for helping keep our community safe. We have reviewed your report and updated its status.
                        </p>
                        
                        <div class="summary-card">
                            <h2 class="summary-title">Report Summary</h2>
                            <div class="summary-item">
                                <span class="summary-label">Report ID:</span>
                                <span class="summary-val">#${data.reportId}</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">Subject:</span>
                                <span class="summary-val">${data.reportTitle}</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">Status:</span>
                                <span class="summary-val">
                                    <span class="badge badge-${data.status}">${data.status}</span>
                                </span>
                            </div>
                            
                            ${
                                data.resolutionNote
                                    ? `<div class="note-card">
                                        <div class="note-title">Moderator Notes:</div>
                                        <div class="note-body">"${data.resolutionNote}"</div>
                                       </div>`
                                    : ''
                            }
                        </div>

                        <p class="text">
                            If you have further questions or additional details to provide, please reply to this email or submit a new ticket through your dashboard.
                        </p>
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