import * as cheerio from 'cheerio';
import https from 'https';
import { URL } from 'url';
import zlib from 'zlib';

export interface ScrapedContent {
  title: string;
  description: string;
  content: string;
  url: string;
}

export async function scrapeUrl(url: string): Promise<ScrapedContent> {
  return new Promise((resolve, reject) => {
    try {
      console.log('Scraping URL:', url);
      
      const parsedUrl = new URL(url);
      const isHttps = parsedUrl.protocol === 'https:';
      
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Connection': 'close'
        },
        timeout: 15000,
        rejectUnauthorized: false
      };

      const client = isHttps ? https : require('http');
      
      const req = client.request(options, (res: any) => {
        let responseStream = res;
        
        // Handle decompression
        if (res.headers['content-encoding'] === 'gzip') {
          responseStream = res.pipe(zlib.createGunzip());
        } else if (res.headers['content-encoding'] === 'deflate') {
          responseStream = res.pipe(zlib.createInflate());
        } else if (res.headers['content-encoding'] === 'br') {
          responseStream = res.pipe(zlib.createBrotliDecompress());
        }
        
        let html = '';
        responseStream.setEncoding('utf8');
        
        responseStream.on('data', (chunk: string) => {
          html += chunk;
        });
        
        responseStream.on('end', () => {
          
          try {
            console.log('HTML received, length:', html.length);
            
            const $ = cheerio.load(html);
            
            // Remove scripts, styles, and other non-content elements
            $('script, style, nav, header, footer, aside, .nav, .menu, .sidebar, .cookie-banner, .newsletter, .advertisement').remove();
            
            // Get all the text content from the page
            let rawContent = $('body').text().trim();
            
            // Clean up whitespace but preserve some structure
            rawContent = rawContent
              .replace(/\s+/g, ' ')
              .replace(/\n+/g, ' ')
              .trim()
              .slice(0, 3000); // Increase limit to get more content
            
            console.log('=== RAW SCRAPED CONTENT ===');
            console.log('Content length:', rawContent.length);
            console.log('First 1000 chars:', rawContent.substring(0, 1000));
            console.log('===========================');

            const result = {
              title: 'Website Content',
              description: 'Scraped website content for analysis',
              content: rawContent,
              url: url
            };

            resolve(result);
          } catch (parseError: any) {
            console.error('Parse error:', parseError.message);
            reject(new Error(`Failed to parse HTML: ${parseError.message}`));
          }
        });
      });

      req.on('error', (error: any) => {
        console.error('Request error:', error.message);
        reject(new Error(`Request failed: ${error.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.setTimeout(15000);
      req.end();
    } catch (error: any) {
      console.error('Setup error:', error.message);
      reject(new Error(`Failed to setup request: ${error.message}`));
    }
  });
}