export default function subscriberTemplate(data: {
    name?: string;
    unsubscribeUrl: string;
    recentPosts?: { title: string; url: string }[];
}) {
    const postsSection =
        data.recentPosts && data.recentPosts.length > 0
            ? `<div class="posts-section">
                <h2 class="section-subtitle">Featured Articles</h2>
                ${data.recentPosts
                    .map(
                        (post) => `
                <div class="post-card">
                    <h3 class="post-title">
                        <a href="${post.url}" class="post-link" target="_blank">${post.title}</a>
                    </h3>
                    <a href="${post.url}" class="read-more" target="_blank">Read full article &rarr;</a>
                </div>`
                    )
                    .join('')}
               </div>`
            : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Latest Updates from Cloudian Blog</title>
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
        .posts-section {
            margin-top: 32px;
            margin-bottom: 24px;
        }
        .section-subtitle {
            font-size: 14px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 16px;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 8px;
        }
        .post-card {
            padding: 16px 0;
            border-bottom: 1px solid #f1f5f9;
        }
        .post-card:last-child {
            border-bottom: none;
        }
        .post-title {
            font-size: 18px;
            font-weight: 700;
            margin-top: 0;
            margin-bottom: 8px;
        }
        .post-link {
            color: #1d4ed8;
            text-decoration: none;
        }
        .post-link:hover {
            text-decoration: underline;
        }
        .post-excerpt {
            color: #475569;
            font-size: 15px;
            margin-top: 0;
            margin-bottom: 12px;
        }
        .read-more {
            color: #1d4ed8;
            font-weight: 600;
            font-size: 14px;
            text-decoration: none;
        }
        .footer {
            padding: 32px;
            background-color: #f8fafc;
            border-top: 1px solid #e2e8f0;
            border-radius: 0 0 4px 4px;
            font-size: 12px;
            color: #64748b;
            text-align: center;
        }
        .unsubscribe-link {
            color: #64748b;
            text-decoration: underline;
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
                        <h1 class="title">Welcome &amp; Latest Updates</h1>
                        <p class="greeting">Hi ${data.name ? data.name : 'there'},</p>
                        <p class="text">
                            Thanks for subscribing to Cloudian Blog! We share articles on programming, engineering best practices, serverless architectures, and modern web development.
                        </p>
                        
                        ${postsSection}
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 Cloudian Blog. All rights reserved.</p>
                        <p>
                            You are receiving this email because you subscribed to our updates.<br>
                            <a href="${data.unsubscribeUrl}" class="unsubscribe-link" target="_blank">Unsubscribe from this list</a>
                        </p>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`;
}