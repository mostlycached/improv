import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export interface ScrapedContent {
  title: string;
  description: string;
  content: string;
  url: string;
}

export async function scrapeUrl(url: string): Promise<ScrapedContent> {
  try {
    console.log('Scraping URL:', url);
    
    // Use node-fetch with proper SSL handling
    const response = await fetch(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      },
      // Disable SSL verification issues
      agent: false
    });

    if (!response.ok) {
      console.error('HTTP error:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    console.log('HTML received, length:', html.length);
    
    // Use Cheerio for better HTML parsing
    const $ = cheerio.load(html);
    
    // Extract title
    let title = $('title').text().trim();
    if (!title) {
      title = $('h1').first().text().trim();
    }
    
    // Extract description from meta tags
    let description = $('meta[name="description"]').attr('content') || 
                     $('meta[property="og:description"]').attr('content') || 
                     $('meta[name="twitter:description"]').attr('content') || '';
    
    // Extract main content text
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
    
    // Fallback to body content if no specific content found
    if (!content) {
      content = $('body').text().trim();
    }
    
    // Clean up content
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
    return result;
  } catch (error: any) {
    console.error('Scraping error:', error.message);
    throw new Error(`Failed to scrape URL: ${error.message}`);
  }
}
