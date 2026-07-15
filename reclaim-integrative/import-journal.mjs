import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { JSDOM } from 'jsdom';

const RSS_URL = 'https://reclaimintegrative.com/rss.xml';
const OUTPUT_FILE = path.join(process.cwd(), 'src', 'data', 'journal.json');

async function run() {
  console.log("Fetching RSS...");
  const res = await fetch(RSS_URL);
  const rssXml = await res.text();
  
  const dom = new JSDOM(rssXml, { contentType: 'text/xml' });
  const items = dom.window.document.querySelectorAll('item');
  
  console.log(`Found ${items.length} items in RSS.`);
  
  const browser = await puppeteer.launch({ headless: 'new' });
  const journalPosts = [];
  
  for (const item of items) {
    const title = item.querySelector('title')?.textContent || '';
    const link = item.querySelector('link')?.textContent || '';
    const pubDate = item.querySelector('pubDate')?.textContent || '';
    const category = item.querySelector('category')?.textContent || '';
    const description = item.querySelector('description')?.textContent || '';
    
    const urlObj = new URL(link);
    const slug = urlObj.pathname.split('/').filter(Boolean).pop() || '';
    
    console.log(`Scraping: ${title}`);
    
    let contentHtml = "";
    try {
      const page = await browser.newPage();
      // Block images/css to speed up
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (req.resourceType() === 'image' || req.resourceType() === 'stylesheet' || req.resourceType() === 'font') {
          req.abort();
        } else {
          req.continue();
        }
      });
      
      await page.goto(link, { waitUntil: 'networkidle0', timeout: 30000 });
      
      // Wait for an article or main prose container
      await page.waitForSelector('article, .prose, main', { timeout: 10000 }).catch(() => {});
      
      contentHtml = await page.evaluate(() => {
        // Find the main content
        const article = document.querySelector('article') || document.querySelector('.prose');
        if (article) return article.innerHTML;
        
        // Fallback: grab all paragraphs inside main
        const main = document.querySelector('main');
        if (main) {
           return main.innerHTML;
        }
        return document.body.innerHTML;
      });
      
      await page.close();
      
      // Basic cleanup of React attrs if needed, but innerHTML is fine for a raw import
    } catch (err) {
      console.error(`Failed to scrape ${link}:`, err.message);
      contentHtml = `<p>${description}</p>`;
    }
    
    journalPosts.push({
      title,
      slug,
      date: new Date(pubDate).toISOString(),
      category,
      excerpt: description,
      content: contentHtml,
      originalUrl: link
    });
  }
  
  await browser.close();
  
  journalPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const dir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(journalPosts, null, 2));
  console.log(`Wrote ${journalPosts.length} posts to ${OUTPUT_FILE}`);
}

run();
