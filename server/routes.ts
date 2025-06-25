import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  urlScrapeSchema, 
  generateContentSchema, 
  generateBackgroundSchema,
  insertAdSchema 
} from "@shared/schema";
import { scrapeUrl } from "./services/scraper";
import { generateAdContent, generateBackgroundImage } from "./services/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Scrape URL endpoint
  app.post("/api/scrape", async (req, res) => {
    try {
      const { url } = urlScrapeSchema.parse(req.body);
      const scrapedContent = await scrapeUrl(url);
      res.json(scrapedContent);
    } catch (error) {
      res.status(400).json({ 
        message: "Failed to scrape URL", 
        error: error.message 
      });
    }
  });

  // Generate ad content from URL
  app.post("/api/generate-content", async (req, res) => {
    try {
      console.log('Generate content request:', req.body);
      const { url } = generateContentSchema.parse(req.body);
      
      // First scrape the URL
      const scrapedContent = await scrapeUrl(url);
      console.log('Scraped content length:', scrapedContent.content.length);
      
      // Then generate ad content using AI
      const generatedContent = await generateAdContent(scrapedContent.content);
      
      res.json(generatedContent);
    } catch (error: any) {
      console.error('Generate content error:', error);
      res.status(400).json({ 
        message: "Failed to generate ad content", 
        error: error?.message || "Unknown error"
      });
    }
  });

  // Generate background image
  app.post("/api/generate-background", async (req, res) => {
    try {
      const { description, style } = generateBackgroundSchema.parse(req.body);
      const imageUrl = await generateBackgroundImage(description, style);
      res.json({ imageUrl });
    } catch (error) {
      res.status(400).json({ 
        message: "Failed to generate background image", 
        error: error.message 
      });
    }
  });

  // Save ad
  app.post("/api/ads", async (req, res) => {
    try {
      const adData = insertAdSchema.parse(req.body);
      const ad = await storage.createAd(adData);
      res.json(ad);
    } catch (error) {
      res.status(400).json({ 
        message: "Failed to save ad", 
        error: error.message 
      });
    }
  });

  // Get ad
  app.get("/api/ads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ad = await storage.getAd(id);
      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }
      res.json(ad);
    } catch (error) {
      res.status(400).json({ 
        message: "Failed to get ad", 
        error: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
