import * as cheerio from 'cheerio';
import https from 'https';
import { URL } from 'url';

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
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'close'
        },
        timeout: 15000,
        rejectUnauthorized: false
      };

      const client = isHttps ? https : require('http');
      
      const req = client.request(options, (res: any) => {
        let data = '';
        
        res.on('data', (chunk: any) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            console.log('HTML received, length:', data.length);
            
            const $ = cheerio.load(data);
            
            let title = $('title').text().trim();
            if (!title) {
              title = $('h1').first().text().trim();
            }
            
            let description = $('meta[name="description"]').attr('content') || 
                             $('meta[property="og:description"]').attr('content') || 
                             $('meta[name="twitter:description"]').attr('content') || '';
            
            $('script, style, nav, header, footer, aside, .nav, .menu, .sidebar').remove();
            
            let content = '';
            const contentSelectors = [
              'main', 'article', '.content', '.post', '.entry', 
              '.product-description', '.description', 'section'
            ];
            
            for (const selector of contentSelectors) {
              const element = $(selector).first();
              if (element.length && element.text().trim().length > 100) {
                content = element.text().trim();
                break;
              }
            }
            
            if (!content) {
              content = $('body').text().trim();
            }
            
            content = content
              .replace(/\s+/g, ' ')
              .replace(/\n+/g, ' ')
              .trim()
              .slice(0, 2000);

            const result = {
              title: title || 'Business Product',
              description: description.trim() || 'Professional solution for your needs',
              content: content || 'Professional business solution designed to meet your specific requirements.',
              url: url
            };

            console.log('Scraping successful:', result.title);
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