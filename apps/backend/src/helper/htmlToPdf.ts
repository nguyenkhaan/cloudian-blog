import puppeteer from "@cloudflare/puppeteer";
import type { BrowserWorker } from "@cloudflare/puppeteer";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function extractTitle(html: string): string {
  const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  if (!titleMatch?.[1]) return "Blog Post";

  const text = titleMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text || "Blog Post";
}

export async function convertPdf(html: string, browserBinding: BrowserWorker): Promise<Uint8Array> {
  const browser = await puppeteer.launch(browserBinding);

  try {
    const page = await browser.newPage();

    await page.setViewport({
      width: 1440,
      height: 1600,
      deviceScaleFactor: 2,
    });

    const title = escapeHtml(extractTitle(html));
    const generatedAt = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const template = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

      :root {
        color-scheme: light;
        --primary: #2563eb;
        --text-main: #0f172a;
        --text-muted: #64748b;
        --border-color: #e2e8f0;
      }

      * { box-sizing: border-box; }
      
      body {
        margin: 0;
        padding: 0;
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background: #ffffff;
        color: var(--text-main);
        line-height: 1.75;
        font-size: 13px;
        -webkit-font-smoothing: antialiased;
      }

      .pdf-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--border-color);
        margin-bottom: 24px;
      }

      .pdf-brand {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--primary);
      }

      .pdf-meta {
        font-size: 11px;
        font-weight: 500;
        color: var(--text-muted);
      }

      .pdf-title {
        font-size: 26px;
        font-weight: 800;
        line-height: 1.3;
        color: var(--text-main);
        margin: 0 0 24px 0;
        letter-spacing: -0.02em;
      }

      .pdf-content {
        color: #334155;
        font-size: 13px;
      }

      .pdf-content h1, .pdf-content h2, .pdf-content h3, .pdf-content h4 {
        color: var(--text-main);
        font-weight: 700;
        line-height: 1.3;
        letter-spacing: -0.01em;
      }

      .pdf-content h1 { font-size: 20px; margin: 28px 0 12px; }
      .pdf-content h2 { font-size: 17px; margin: 24px 0 10px; }
      .pdf-content h3 { font-size: 15px; margin: 20px 0 8px; }
      .pdf-content h4 { font-size: 13px; margin: 16px 0 6px; }

      .pdf-content p {
        margin: 0 0 14px;
        word-wrap: break-word;
      }

      .pdf-content a {
        color: var(--primary);
        text-decoration: none;
        font-weight: 500;
      }

      .pdf-content ul, .pdf-content ol {
        padding-left: 22px;
        margin: 0 0 14px;
      }

      .pdf-content li {
        margin-bottom: 6px;
      }

      .pdf-content blockquote {
        margin: 18px 0;
        padding: 12px 18px;
        border-left: 3px solid var(--primary);
        background: #f8fafc;
        color: #1e293b;
        font-style: italic;
      }

      .pdf-content img {
        display: block;
        max-width: 100%;
        height: auto;
        margin: 20px auto;
        border-radius: 6px;
      }

      .pdf-content pre {
        background: #0f172a;
        color: #f1f5f9;
        padding: 14px 16px;
        border-radius: 6px;
        overflow-x: auto;
        white-space: pre-wrap;
        word-break: break-all;
        margin: 16px 0;
        font-family: 'JetBrains Mono', Consolas, monospace;
        font-size: 11.5px;
        line-height: 1.6;
      }

      .pdf-content code {
        font-family: 'JetBrains Mono', Consolas, monospace;
        font-size: 11.5px;
        background: #f1f5f9;
        color: #0f172a;
        padding: 2px 5px;
        border-radius: 4px;
      }

      .pdf-content pre code {
        background: transparent;
        color: inherit;
        padding: 0;
      }

      .pdf-content table {
        width: 100%;
        border-collapse: collapse;
        margin: 18px 0;
      }

      .pdf-content th, .pdf-content td {
        padding: 8px 12px;
        text-align: left;
        border: 1px solid var(--border-color);
      }

      .pdf-content th {
        background: #f8fafc;
        font-weight: 600;
        color: var(--text-main);
      }

      .pdf-content hr {
        border: none;
        border-top: 1px solid var(--border-color);
        margin: 24px 0;
      }
    </style>
  </head>
  <body>
    <div class="pdf-header">
      <div class="pdf-brand">CloudianZea</div>
      <div class="pdf-meta">Published on ${generatedAt}</div>
    </div>
    <h1 class="pdf-title">${title}</h1>
    <div class="pdf-content">${html}</div>
  </body>
</html>`;

    await page.setContent(template, {
      waitUntil: "networkidle0",
    });

    await page.evaluate(async () => {
      const doc = (globalThis as any).document;
      if (!doc) return;

      const images = Array.from(doc.images || []);
      await Promise.all(
        images.map((img: any) => {
          if (!img) return Promise.resolve();
          if (img.complete) return Promise.resolve();
          return new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
        })
      );

      const fonts = doc.fonts;
      if (fonts && typeof fonts.ready?.then === "function") {
        await fonts.ready;
      }
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="width: 100%; font-size: 9px; font-family: sans-serif; color: #94a3b8; text-align: right; padding-right: 20px;">
          CloudianZea Document
        </div>
      `,
      footerTemplate: `
        <div style="width: 100%; font-size: 9px; font-family: sans-serif; color: #94a3b8; display: flex; justify-content: space-between; padding: 0 20px 8px;">
          <span>Generated via CloudianZea</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
      margin: {
        top: "1.8cm",
        bottom: "1.8cm",
        left: "1.5cm",
        right: "1.5cm",
      },
    });

    return pdf;
  } finally {
    await browser.close();
  }
}