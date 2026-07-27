import { AppEnv } from "@/types/env";
import puppeteer from "@cloudflare/puppeteer";
import type { BrowserWorker } from "@cloudflare/puppeteer";
interface Env {
  MY_BROWSER: Fetcher;
}

export async function convertPdf(html: string, browserBinding: BrowserWorker): Promise<Uint8Array> {
  const browser = await puppeteer.launch(browserBinding);

  try {
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "domcontentloaded",
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true, 
      
      headerTemplate: `<div></div>`,
      footerTemplate: `
        <div style="width: 100%; font-size: 10px; font-family: sans-serif; color: #666; text-align: center; padding-bottom: 5px;">
          CloudianZea
        </div>
      `,

      margin: {
        top: "2cm",
        bottom: "2cm",
        left: "3cm",
        right: "1.5cm",
      },
    });

    return pdf;
  } finally {
    await browser.close();
  }
}