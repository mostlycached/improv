import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const ads = pgTable("ads", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  ctaText: text("cta_text").notNull(),
  primaryColor: text("primary_color").notNull().default("#4285F4"),
  accentColor: text("accent_color").notNull().default("#EA4335"),
  layout: text("layout").notNull().default("bottom-overlay"),
  backgroundImageUrl: text("background_image_url"),
  canvasData: text("canvas_data"), // base64 encoded image data
});

export const insertAdSchema = createInsertSchema(ads).omit({
  id: true,
});

export type InsertAd = z.infer<typeof insertAdSchema>;
export type Ad = typeof ads.$inferSelect;

// API schemas
export const urlScrapeSchema = z.object({
  url: z.string().url(),
});

export const generateContentSchema = z.object({
  url: z.string().url(),
});

export const generateBackgroundSchema = z.object({
  description: z.string(),
  style: z.enum(["Photorealistic", "Geometric Abstraction", "Neo-Memphis", "Gradient Silhouette", "Brutalist Gradient"]).default("Photorealistic"),
  personArchetype: z.enum([
    "Healthcare Professional",
    "Construction Worker", 
    "Business Executive",
    "Tech Developer",
    "Teacher/Educator",
    "Chef/Restaurant Worker",
    "Retail Associate",
    "Creative Professional",
    "Fitness Trainer",
    "Customer Service Rep"
  ]).optional(),
  environment: z.enum([
    "Modern Office",
    "Hospital/Medical Facility",
    "Construction Site",
    "Tech Workspace",
    "Classroom",
    "Restaurant Kitchen",
    "Retail Store",
    "Creative Studio",
    "Gym/Fitness Center",
    "Call Center"
  ]).optional(),
  colorPalette: z.enum([
    "Corporate Blue",
    "Sage Green",
    "Warm Terracotta",
    "Deep Purple",
    "Monochrome",
    "Sunset Orange",
    "Ocean Teal",
    "Rich Burgundy"
  ]).optional(),
});

export type UrlScrapeRequest = z.infer<typeof urlScrapeSchema>;
export type GenerateContentRequest = z.infer<typeof generateContentSchema>;
export type GenerateBackgroundRequest = z.infer<typeof generateBackgroundSchema>;
